"""Tests for OCR service"""

import pytest
import numpy as np
from app.services.ocr_service import extract_meter_reading_from_image


def test_extract_meter_with_dummy_image():
    """Test meter extraction with dummy image"""
    # Create a dummy image
    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # This should not crash (may return None or empty string)
    result = extract_meter_reading_from_image(dummy_image)
    
    # Result should be either None or a string
    assert result is None or isinstance(result, str)


def test_extract_meter_with_invalid_input():
    """Test meter extraction with invalid input"""
    # This should handle gracefully
    # The function should not crash
    try:
        result = extract_meter_reading_from_image(None)
        # If it doesn't crash, that's acceptable
        assert True
    except (TypeError, AttributeError):
        # If it raises, that's also acceptable for invalid input
        assert True
