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
    assert "status" in data


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


@patch('app.services.ocr_service.extract_meter_reading_from_image')
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
    assert "success" in data or "data" in data


def test_summarize_no_file(client):
    """Test summarize endpoint without file"""
    response = client.post("/api/v1/ai/summarize")
    assert response.status_code == 422  # Missing required file


@patch('app.services.llm_service.summarize_content')
def test_summarize_with_file(mock_summarize, client):
    """Test summarize endpoint with valid file"""
    mock_summarize.return_value = {"summary": "Test summary", "events": []}
    
    # Create a text file
    response = client.post(
        "/api/v1/ai/summarize",
        files={"file": ("test.txt", io.BytesIO(b"Test content"), "text/plain")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "success" in data or "data" in data
