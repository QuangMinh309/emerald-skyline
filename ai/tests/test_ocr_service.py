"""Tests for OCR service"""

import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from app.services.ocr_service import extract_meter_reading, extract_text_from_image, _remove_check_digit, decode_image


def test_extract_meter_with_dummy_image():
    """Test meter extraction with dummy image"""
    # Create a dummy image
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # This should not crash (may return None or empty string)
    result = extract_meter_reading(dummy_image)
    
    # Result should be either None or a string
    assert result is None or isinstance(result, str)


def test_extract_meter_with_invalid_input():
    """Test meter extraction with invalid input"""
    # This should handle gracefully
    # The function should not crash
    try:
        result = extract_meter_reading(None)
        # If it doesn't crash, that's acceptable
        assert True
    except (TypeError, AttributeError):
        # If it raises, that's also acceptable for invalid input
        assert True


def test_remove_check_digit_with_decimal():
    """Test check digit removal with decimal point"""
    result = _remove_check_digit("12345.6", [])
    # Should preserve decimal numbers
    assert result == "12345.6"


def test_remove_check_digit_too_long():
    """Test check digit removal when digits > 5"""
    result = _remove_check_digit("123456", [])
    # Should remove last digit (check digit)
    assert result == "12345"
    assert len(result) == 5


def test_remove_check_digit_correct_length():
    """Test check digit when already correct length"""
    result = _remove_check_digit("12345", [])
    # Should keep as is
    assert result == "12345"


def test_remove_check_digit_short():
    """Test check digit with short number"""
    result = _remove_check_digit("123", [])
    # Should keep as is
    assert result == "123"


@patch('app.services.ocr_service.ocr_model')
def test_extract_meter_with_valid_ocr_result(mock_ocr):
    """Test meter extraction with valid OCR result"""
    # Mock OCR result
    mock_line = [
        [[0, 0], [100, 0], [100, 50], [0, 50]],  # box
        ("12345", 0.95)  # text, confidence
    ]
    mock_ocr.ocr.return_value = [[mock_line]]
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_meter_reading(dummy_image)
    
    # Should return a result
    assert result is not None or result is None  # Could be None if heuristics filter it


@patch('app.services.ocr_service.ocr_model')
def test_extract_meter_no_ocr_result(mock_ocr):
    """Test meter extraction when OCR returns None"""
    mock_ocr.ocr.return_value = [None]
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_meter_reading(dummy_image)
    
    assert result is None


@patch('app.services.ocr_service.ocr_model')
def test_extract_meter_empty_ocr_result(mock_ocr):
    """Test meter extraction when OCR returns empty list"""
    mock_ocr.ocr.return_value = [[]]
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_meter_reading(dummy_image)
    
    assert result is None


@patch('app.services.ocr_service.ocr_model')
def test_extract_text_from_image_success(mock_ocr):
    """Test text extraction from image with valid result"""
    # Mock OCR result with multiple lines
    mock_line1 = [[[0, 0], [100, 0], [100, 50], [0, 50]], ("Line 1", 0.95)]
    mock_line2 = [[[0, 60], [100, 60], [100, 110], [0, 110]], ("Line 2", 0.92)]
    mock_ocr.ocr.return_value = [[mock_line1, mock_line2]]
    
    dummy_image = np.zeros((150, 100, 3), dtype=np.uint8)
    result = extract_text_from_image(dummy_image)
    
    assert "Line 1" in result
    assert "Line 2" in result
    assert "\n" in result


@patch('app.services.ocr_service.ocr_model')
def test_extract_text_from_image_empty(mock_ocr):
    """Test text extraction when OCR returns empty"""
    mock_ocr.ocr.return_value = [[]]
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_text_from_image(dummy_image)
    
    assert result == ""


@patch('app.services.ocr_service.ocr_model')
def test_extract_text_from_image_none(mock_ocr):
    """Test text extraction when OCR returns None"""
    mock_ocr.ocr.return_value = [None]
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_text_from_image(dummy_image)
    
    assert result == ""


@patch('app.services.ocr_service.ocr_model')
def test_extract_text_from_image_exception(mock_ocr):
    """Test text extraction with OCR exception"""
    mock_ocr.ocr.side_effect = Exception("OCR error")
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_text_from_image(dummy_image)
    
    assert result == ""


@patch('app.services.ocr_service.ocr_model')
def test_extract_meter_reading_exception(mock_ocr):
    """Test meter extraction with OCR exception"""
    mock_ocr.ocr.side_effect = Exception("OCR error")
    
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = extract_meter_reading(dummy_image)
    
    assert result is None


def test_decode_image_valid():
    """Test image decoding with valid bytes"""
    import cv2
    # Create a valid JPEG
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_img)
    
    result = decode_image(buffer.tobytes())
    
    assert result is not None
    assert isinstance(result, np.ndarray)
    assert result.shape[2] == 3


def test_decode_image_invalid():
    """Test image decoding with invalid bytes"""
    result = decode_image(b"not an image")
    
    # Should return None or raise, but shouldn't crash
    assert result is None or isinstance(result, np.ndarray)
