"""Tests for main FastAPI application"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "AI Service is running"


def test_docs_available(client):
    """Test that API docs are available"""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "openapi" in response.text.lower()
