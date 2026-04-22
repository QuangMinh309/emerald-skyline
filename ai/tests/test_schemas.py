"""Tests for Pydantic schemas"""

import pytest
from app.models.schemas import (
    CCCDResponse,
    OCRResponse,
    SummarizeResponse,
    FieldConfidence,
    CCCDData,
    EventDetail,
)


def test_cccd_response_schema():
    """Test CCCD response schema"""
    field_conf = FieldConfidence(
        name=0.95,
        id_number=0.99,
        date_of_birth=0.98,
        date_expiration=0.95,
        gender=0.99,
        nationality=0.99,
        native_place=0.90,
        place_of_residence=0.90
    )
    
    cccd_data = CCCDData(
        name="Test Name",
        id_number="123456789012",
        date_of_birth="01/01/2000",
        date_expiration="01/01/2030",
        gender="Nam",
        nationality="Việt Nam",
        native_place="Test Place",
        place_of_residence="Test Address",
        overall_confidence=0.95,
        field_confidence=field_conf,
        notes="Test note"
    )
    
    response = CCCDResponse(
        success=True,
        data=cccd_data,
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


def test_ocr_response():
    """Test OCR response schema"""
    response = OCRResponse(
        meter_reading="12345.67",
        status="success",
        message="Successfully extracted meter reading"
    )
    
    assert response.status == "success"
    assert response.meter_reading == "12345.67"


def test_ocr_response_failed():
    """Test OCR response with failure"""
    response = OCRResponse(
        meter_reading=None,
        status="failed",
        message="Could not extract meter reading"
    )
    
    assert response.status == "failed"
    assert response.meter_reading is None


def test_summarize_response():
    """Test summarize response schema"""
    event1 = EventDetail(
        event_name="Test Event",
        time="10:00 AM",
        location="Building A",
        note="Please be present"
    )
    
    response = SummarizeResponse(
        events=[event1],
        original_length=100,
        status="success"
    )
    
    assert response.status == "success"
    assert len(response.events) == 1
    assert response.events[0].event_name == "Test Event"


def test_summarize_response_empty():
    """Test summarize response with no events"""
    response = SummarizeResponse(
        events=[],
        original_length=50,
        status="success"
    )
    
    assert response.status == "success"
    assert len(response.events) == 0
