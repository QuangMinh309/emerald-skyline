"""Tests for YOLO detector"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from app.services.yolo_detector import YOLOCCCDDetector, CCCD_CLASSES


def test_cccd_classes_mapping():
    """Test that CCCD classes are properly mapped"""
    assert "name" in CCCD_CLASSES.values()
    assert "id" in CCCD_CLASSES.values()
    assert "dob" in CCCD_CLASSES.values()
    assert "gender" in CCCD_CLASSES.values()
    assert len(CCCD_CLASSES) == 8


@patch('app.services.yolo_detector.YOLO')
def test_detector_load_model(mock_yolo):
    """Test detector model loading"""
    mock_yolo.return_value = MagicMock()
    
    # This will try to load model, should handle it
    try:
        detector = YOLOCCCDDetector("best.pt")
        # Model loading attempted
        assert detector.model is not None
    except FileNotFoundError:
        # File doesn't exist in test environment, that's ok
        pytest.skip("Model file not available in test environment")


def test_preprocess_image():
    """Test image preprocessing"""
    # Create a test image
    test_image = np.random.randint(0, 255, (800, 1200, 3), dtype=np.uint8)
    
    detector = YOLOCCCDDetector.__new__(YOLOCCCDDetector)
    detector.model = None
    
    # Test preprocessing
    preprocessed = detector._preprocess_image(test_image)
    
    assert isinstance(preprocessed, np.ndarray)
    assert preprocessed.ndim == 3
    assert preprocessed.shape[2] == 3  # Still BGR
    # Should be resized
    assert preprocessed.shape[0] <= test_image.shape[0]
    assert preprocessed.shape[1] <= test_image.shape[1]


def test_preprocess_small_image():
    """Test preprocessing small image (should upscale)"""
    # Create a small test image
    test_image = np.random.randint(0, 255, (100, 150, 3), dtype=np.uint8)
    
    detector = YOLOCCCDDetector.__new__(YOLOCCCDDetector)
    detector.model = None
    
    # Test preprocessing
    preprocessed = detector._preprocess_image(test_image)
    
    assert isinstance(preprocessed, np.ndarray)
    # Should be upscaled
    assert preprocessed.shape[0] >= test_image.shape[0]
    assert preprocessed.shape[1] >= test_image.shape[1]
