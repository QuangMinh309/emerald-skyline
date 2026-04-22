"""Tests for Pydantic schemas"""

import pytest
from app.models.schemas import (
    CCCDResponse,
    OCRMeterResponse,
    SummarizeResponse,
)


def test_cccd_response_schema():
    """Test CCCD response schema"""
    # Valid response
    response = CCCDResponse(
        success=True,
        data={
            "name": "Test Name",
            "id_number": "123456789012",
            "date_of_birth": "01/01/2000",
            "date_expiration": "01/01/2030",
            "gender": "Nam",
            "nationality": "Việt Nam",
            "native_place": "Test Place",
            "place_of_residence": "Test Address",
            "overall_confidence": 0.95,
            "field_confidence": {
                "name": 0.95,
                "id_number": 0.99,
                "date_of_birth": 0.98,
                "date_expiration": 0.95,
                "gender": 0.99,
                "nationality": 0.99,
                "native_place": 0.90,
                "place_of_residence": 0.90
            }
        },
        ocr_confidence=0.95,
        raw_text=None,
        error=None,
        message="Success"
    )
    
    assert response.success is True
    assert response.data is not None
    assert response.message == "Success"


def test_cccd_response_error():
    """Test CCCD response with error"""
    response = CCCDResponse(
        success=False,
        data=None,
        ocr_confidence=0.0,
        raw_text=None,
        error="Test error",
        message="Failed"
    )
    
    assert response.success is False
    assert response.data is None
    assert response.error == "Test error"


def test_ocr_meter_response():
    """Test OCR meter response schema"""
    response = OCRMeterResponse(
        success=True,
        data={"index": 12345.67, "raw_text": "12345.67"},
        ocr_confidence=0.98,
        raw_text="12345.67",
        error=None,
        message="Success"
    )
    
    assert response.success is True
    assert response.data["index"] == 12345.67


def test_summarize_response():
    """Test summarize response schema"""
    response = SummarizeResponse(
        success=True,
        data={"summary": "Test summary", "events": []},
        message="Success"
    )
    
    assert response.success is True
    assert "summary" in response.data
