"""Tests for CCCD service"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from app.services.cccd_service import (
    decode_image,
    extract_text_from_region,
    _cluster_text_blocks_into_fields,
    extract_cccd_info,
    extract_cccd_regions_with_yolo,
    parse_cccd_with_llm,
    get_groq_client,
)


def test_decode_image():
    """Test image decoding"""
    # Create a dummy image
    dummy_image = np.ones((100, 100, 3), dtype=np.uint8) * 255
    
    # Encode to bytes
    import cv2
    _, buffer = cv2.imencode('.jpg', dummy_image)
    image_bytes = buffer.tobytes()
    
    # Decode
    result = decode_image(image_bytes)
    
    assert result is not None
    assert isinstance(result, np.ndarray)
    assert result.shape[2] == 3  # BGR image


def test_extract_text_from_region():
    """Test text extraction from region"""
    # Create a dummy region image
    region_image = np.ones((50, 50, 3), dtype=np.uint8) * 200
    
    # This should not crash
    result = extract_text_from_region(region_image, field_type="name")
    
    # Result should be a string
    assert isinstance(result, str)


def test_cluster_text_blocks_into_fields():
    """Test clustering text blocks into fields"""
    # Create dummy text blocks
    text_blocks = [
        {
            "text": "NGÔ MINH TRÍ",
            "conf": 0.95,
            "bbox": (10, 10, 100, 30),
            "y_pos": 10,
            "region_image": np.ones((20, 90, 3), dtype=np.uint8)
        },
        {
            "text": "083205005215",
            "conf": 0.99,
            "bbox": (10, 40, 150, 60),
            "y_pos": 40,
            "region_image": np.ones((20, 140, 3), dtype=np.uint8)
        },
        {
            "text": "Nam",
            "conf": 0.98,
            "bbox": (200, 50, 250, 70),
            "y_pos": 50,
            "region_image": np.ones((20, 50, 3), dtype=np.uint8)
        }
    ]
    
    dummy_image = np.ones((300, 300, 3), dtype=np.uint8)
    
    # Cluster the blocks
    result = _cluster_text_blocks_into_fields(text_blocks, dummy_image)
    
    # Should return a dictionary
    assert isinstance(result, dict)
    # Should have some fields extracted
    assert len(result) > 0


def test_cluster_empty_text_blocks():
    """Test clustering with empty text blocks"""
    text_blocks = []
    dummy_image = np.ones((300, 300, 3), dtype=np.uint8)
    
    result = _cluster_text_blocks_into_fields(text_blocks, dummy_image)
    
    assert isinstance(result, dict)
    assert len(result) == 0


@patch('app.services.cccd_service.extract_cccd_regions_with_yolo')
@patch('app.services.cccd_service.parse_cccd_with_llm')
def test_extract_cccd_info_success(mock_parse, mock_yolo, sample_image):
    """Test extract_cccd_info with successful extraction"""
    # Mock YOLO detection
    mock_yolo.return_value = {
        "success": True,
        "regions": {
            "name": np.ones((50, 100, 3), dtype=np.uint8),
            "id": np.ones((50, 100, 3), dtype=np.uint8)
        }
    }
    
    # Mock LLM parsing
    from app.models.schemas import CCCDData
    mock_parse.return_value = CCCDData(
        name="Test User",
        id="123456789",
        dob="01/01/2000",
        gender="Male",
        nationality="Việt Nam",
        origin_place="Hà Nội",
        current_place="TP Hồ Chí Minh",
        expire_date="01/01/2030",
        overall_confidence=0.85
    )
    
    result = extract_cccd_info(sample_image)
    
    assert result["success"] is True
    assert result["data"] is not None
    assert result["data"].name == "Test User"


@patch('app.services.cccd_service.extract_cccd_regions_with_yolo')
@patch('app.services.cccd_service.parse_cccd_with_llm')
def test_extract_cccd_info_failure(mock_parse, mock_yolo, sample_image):
    """Test extract_cccd_info with extraction failure"""
    # Mock YOLO detection failure
    mock_yolo.return_value = {
        "success": False,
        "error": "YOLO detection failed"
    }
    
    result = extract_cccd_info(sample_image)
    
    assert result["success"] is False
    assert "error" in result


@patch('app.services.cccd_service.YOLOCCCDDetector')
def test_extract_cccd_regions_with_yolo_success(mock_detector_class, sample_image):
    """Test YOLO detection with successful regions"""
    # Mock detector instance
    mock_detector = MagicMock()
    mock_detector_class.return_value = mock_detector
    mock_detector.detect_regions.return_value = {
        "regions": {
            "name": np.ones((50, 100, 3), dtype=np.uint8),
            "id": np.ones((50, 100, 3), dtype=np.uint8),
            "dob": np.ones((50, 100, 3), dtype=np.uint8)
        },
        "confidence": 0.85
    }
    
    result = extract_cccd_regions_with_yolo(sample_image)
    
    assert result["success"] is True
    assert "regions" in result


@patch('app.services.cccd_service.get_groq_client')
@patch('app.services.cccd_service.extract_text_from_region')
def test_parse_cccd_with_llm(mock_extract_text, mock_get_groq):
    """Test LLM parsing of CCCD data"""
    # Mock text extraction
    mock_extract_text.return_value = "Nguyễn Văn A"
    
    # Mock Groq client
    mock_client = MagicMock()
    mock_get_groq.return_value = mock_client
    
    # Mock LLM response
    mock_response = MagicMock()
    mock_response.choices[0].message.content = """{
        "name": "Nguyễn Văn A",
        "id": "123456789",
        "dob": "01/01/2000",
        "gender": "Nam",
        "nationality": "Việt Nam",
        "origin_place": "Hà Nội",
        "current_place": "TP Hồ Chí Minh",
        "expire_date": "01/01/2030",
        "overall_confidence": 0.85
    }"""
    mock_client.messages.create.return_value = mock_response
    
    regions = {
        "name": np.ones((50, 100, 3), dtype=np.uint8),
        "id": np.ones((50, 100, 3), dtype=np.uint8)
    }
    
    result = parse_cccd_with_llm(regions, mode="yolo_detected")
    
    assert result is not None
    assert hasattr(result, 'name')


def test_get_groq_client():
    """Test Groq client lazy initialization"""
    client = get_groq_client()
    
    assert client is not None
    # Should be a Groq client instance
    assert hasattr(client, 'messages')
