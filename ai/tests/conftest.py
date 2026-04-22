"""Pytest configuration and fixtures"""

import pytest
import os
import sys
import numpy as np
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Create a sample test image"""
    # Create a dummy image (100x100 BGR)
    image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    return image


@pytest.fixture
def sample_image_bytes(sample_image):
    """Convert sample image to bytes"""
    import cv2
    _, buffer = cv2.imencode('.jpg', sample_image)
    return buffer.tobytes()
