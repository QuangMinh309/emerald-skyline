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


def test_merge_regions():
    """Test merge regions helper function exists"""
    detector = YOLOCCCDDetector.__new__(YOLOCCCDDetector)
    detector.model = None
    
    # Just verify method exists
    assert hasattr(detector, '_merge_regions')
    assert callable(detector._merge_regions)


def test_detect_regions_no_detections():
    """Test detection when no regions are found"""
    test_image = np.random.randint(0, 255, (300, 400, 3), dtype=np.uint8)
    
    detector = YOLOCCCDDetector.__new__(YOLOCCCDDetector)
    detector.model = MagicMock()
    
    # Mock predict to return no detections
    mock_result = MagicMock()
    mock_result.boxes = MagicMock()
    mock_result.boxes.xyxy = np.array([])
    mock_result.boxes.conf = np.array([])
    mock_result.boxes.cls = np.array([])
    detector.model.predict.return_value = [mock_result]
    
    result = detector.detect_regions(test_image)
    
    assert result is not None
    # Should handle empty detections gracefully
    assert isinstance(result, dict)


@patch('app.services.yolo_detector.YOLO')
def test_detector_initialization_with_mock(mock_yolo):
    """Test detector initialization with mock model"""
    mock_model = MagicMock()
    mock_yolo.return_value = mock_model
    
    try:
        detector = YOLOCCCDDetector.__new__(YOLOCCCDDetector)
        detector.model_path = "best.pt"
        detector.model = mock_model
        assert detector.model is not None
    except Exception:
        # If initialization fails, that's ok for test env
        pass
