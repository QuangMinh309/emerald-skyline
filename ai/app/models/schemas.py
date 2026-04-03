from pydantic import BaseModel
from typing import List, Optional

class SummarizeRequest(BaseModel):
    text: str # NestJS gửi lên đoạn text cần tóm tắt


class EventDetail(BaseModel):
    event_name: str
    time: str
    location: str
    note: str


class SummarizeResponse(BaseModel):
    """Response model for summarization with events"""
    events: List[EventDetail]  # <-- Trả về danh sách Event
    original_length: int
    status: str


class OCRResponse(BaseModel):
    meter_reading: str | None # Kết quả đọc được (có thể null nếu ko đọc được)
    status: str              # "success" hoặc "failed"
    message: str             # Ghi chú thêm


# ===== CCCD SCHEMAS =====

class FieldConfidence(BaseModel):
    """Confidence score for each CCCD field"""
    name: float
    id_number: float
    date_of_birth: float
    date_expiration: float
    gender: float
    nationality: float
    native_place: float
    place_of_residence: float


class CCCDData(BaseModel):
    """Extracted CCCD information - Vietnamese Standard (from YOLO dataset)"""
    # Personal information
    name: str  # Họ tên
    date_of_birth: str  # Ngày sinh (DD/MM/YYYY)
    gender: str  # Giới tính (Nam, Nữ)
    nationality: str  # Quốc tịch (Việt Nam)
    
    # ID Information
    id_number: str  # Số CCCD (12 or 9 digits)
    
    # Address information (from YOLO: origin_place, current_place)
    native_place: str  # Quê quán / Nơi sinh (from origin_place YOLO region)
    place_of_residence: str  # Nơi thường trú (from current_place YOLO region)
    
    # Card information
    date_expiration: str  # Ngày hết hạn (DD/MM/YYYY)
    
    # Confidence and metadata
    overall_confidence: float
    field_confidence: FieldConfidence
    notes: Optional[str] = None


class CCCDResponse(BaseModel):
    """Response model for CCCD extraction"""
    success: bool
    data: Optional[CCCDData] = None
    ocr_confidence: float
    raw_text: Optional[str] = None  # For debugging
    error: Optional[str] = None
    message: Optional[str] = None