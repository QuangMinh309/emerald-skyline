"""Tests for CCCD service"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from app.services.cccd_service import (
    decode_image,
    extract_text_from_region,
    _cluster_text_blocks_into_fields,
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
