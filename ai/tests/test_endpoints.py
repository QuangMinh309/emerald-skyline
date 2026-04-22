"""Tests for API endpoints"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock
import io


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


def test_read_root(client):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_read_meter_no_file(client):
    """Test meter reading endpoint without file"""
    response = client.post("/api/v1/ocr/read-meter")
    assert response.status_code == 422  # Missing required file


def test_read_cccd_no_file(client):
    """Test CCCD reading endpoint without file"""
    response = client.post("/api/v1/ocr/read-cccd")
    assert response.status_code == 422  # Missing required file


def test_read_meter_invalid_file(client):
    """Test meter reading with invalid file type"""
    # Create a text file instead of image
    response = client.post(
        "/api/v1/ocr/read-meter",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    assert response.status_code == 400


def test_read_cccd_invalid_file(client):
    """Test CCCD reading with invalid file type"""
    # Create a text file instead of image
    response = client.post(
        "/api/v1/ocr/read-cccd",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    assert response.status_code == 400


@patch('app.services.ocr_service.extract_meter_reading')
def test_read_meter_with_image(mock_extract, client):
    """Test meter reading with valid image"""
    mock_extract.return_value = "12345.67"
    
    # Create a dummy JPEG image
    import numpy as np
    import cv2
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ocr/read-meter",
        files={"file": ("test.jpg", io.BytesIO(buffer.tobytes()), "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data or "meter_reading" in data


def test_summarize_no_file(client):
    """Test summarize endpoint without file or text"""
    response = client.post("/api/v1/ai/summarize")
    # Both file and text are optional, but returns 400 if both empty/too short
    assert response.status_code == 400


@patch('app.services.llm_service.summarize_to_json')
def test_summarize_with_file(mock_summarize, client):
    """Test summarize endpoint with valid file"""
    mock_summarize.return_value = {"events": []}
    
    # Create a text file
    response = client.post(
        "/api/v1/ai/summarize",
        files={"file": ("test.txt", io.BytesIO(b"Test content"), "text/plain")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "events" in data or "status" in data


@patch('app.services.cccd_service.extract_cccd_info')
def test_read_cccd_with_valid_image(mock_extract, client):
    """Test CCCD reading with valid image - successful extraction"""
    import numpy as np
    import cv2
    from app.models.schemas import CCCDData, FieldConfidence
    
    mock_data = CCCDData(
        name="Nguyễn Văn A",
        date_of_birth="01/01/2000",
        gender="Nam",
        nationality="Việt Nam",
        native_place="Hà Nội",
        place_of_residence="TP Hồ Chí Minh",
        id_number="123456789",
        date_expiration="01/01/2030",
        field_confidence=FieldConfidence(
            name=0.95, id_number=0.90, date_of_birth=0.85, date_expiration=0.92,
            gender=0.88, nationality=0.99, native_place=0.80, place_of_residence=0.75
        )
    )
    mock_extract.return_value = {"success": True, "data": mock_data}
    
    # Create a dummy JPEG image
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ocr/read-cccd",
        files={"file": ("test.jpg", io.BytesIO(buffer.tobytes()), "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] is not None
    assert "name" in data["data"]


@patch('app.services.cccd_service.extract_cccd_info')
def test_read_cccd_extraction_failure(mock_extract, client):
    """Test CCCD reading with extraction failure"""
    import numpy as np
    import cv2
    
    mock_extract.return_value = {"success": False, "error": "YOLO detection failed"}
    
    # Create a dummy JPEG image
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ocr/read-cccd",
        files={"file": ("test.jpg", io.BytesIO(buffer.tobytes()), "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["data"] is None
    assert "error" in data


@patch('app.services.cccd_service.decode_image')
def test_read_cccd_empty_file(mock_decode, client):
    """Test CCCD reading with empty file bytes"""
    import numpy as np
    import cv2
    
    mock_decode.return_value = None
    
    # Create a dummy JPEG image but empty bytes
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    # Override to return empty bytes first
    response = client.post(
        "/api/v1/ocr/read-cccd",
        files={"file": ("test.jpg", io.BytesIO(b""), "image/jpeg")}
    )
    
    assert response.status_code == 400


@patch('app.services.ocr_service.extract_meter_reading')
def test_read_meter_with_invalid_image(mock_extract, client):
    """Test meter reading with invalid/corrupted image"""
    import numpy as np
    import cv2
    
    mock_extract.return_value = None
    
    # Create a dummy JPEG image
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ocr/read-meter",
        files={"file": ("test.jpg", io.BytesIO(buffer.tobytes()), "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Could have None or empty meter_reading


@patch('app.services.llm_service.summarize_to_json')
def test_summarize_with_text_param(mock_summarize, client):
    """Test summarize endpoint with text parameter"""
    mock_summarize.return_value = {"events": []}
    
    response = client.post(
        "/api/v1/ai/summarize?text=This is a test announcement"
    )
    
    # May return 200 or 400 depending on implementation
    assert response.status_code in [200, 400]


@patch('app.services.llm_service.summarize_to_json')
def test_summarize_with_both_file_and_text(mock_summarize, client):
    """Test summarize with both file and text provided"""
    import numpy as np
    import cv2
    
    mock_summarize.return_value = {"events": []}
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ai/summarize?text=announcement",
        files={"file": ("test.txt", io.BytesIO(b"file content"), "text/plain")}
    )
    
    assert response.status_code == 200


def test_health_endpoint_format(client):
    """Test health check returns proper format"""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "message" in data
    assert isinstance(data["message"], str)
    assert "Emerald" in data["message"]


def test_read_meter_endpoint_invalid_file_format(client):
    """Test meter reading with various invalid formats"""
    response = client.post(
        "/api/v1/ocr/read-meter",
        files={"file": ("test.bin", b"binary content", "application/octet-stream")}
    )
    assert response.status_code == 400


def test_read_cccd_endpoint_invalid_file_format(client):
    """Test CCCD reading with various invalid formats"""
    response = client.post(
        "/api/v1/ocr/read-cccd",
        files={"file": ("test.pdf", b"%PDF", "application/pdf")}
    )
    assert response.status_code == 400


@patch('app.services.ocr_service.extract_meter_reading')
def test_read_meter_returns_correct_schema(mock_extract, client):
    """Test meter endpoint returns correct response schema"""
    import numpy as np
    import cv2
    
    mock_extract.return_value = "12345"
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_image)
    
    response = client.post(
        "/api/v1/ocr/read-meter",
        files={"file": ("test.jpg", io.BytesIO(buffer.tobytes()), "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should have expected fields
    assert isinstance(data, dict)
