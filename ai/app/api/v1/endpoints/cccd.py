# app/api/v1/endpoints/cccd.py
"""
CCCD (Vietnamese ID Card) OCR Endpoint
Extracts structured information from CCCD images using YOLO + OCR + LLM
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cccd_service import extract_cccd_info, decode_image
from app.models.schemas import CCCDResponse

router = APIRouter()


@router.post("/read-cccd", response_model=CCCDResponse)
async def read_cccd(file: UploadFile = File(...)):
    """
    Extract structured information from Vietnamese ID Card (CCCD) image
    
    Uses advanced 3-phase processing:
    - Phase 1: YOLOv8 for region detection (name, dob, id, address, etc.)
    - Phase 2: Region-specific OCR for text extraction
    - Phase 3: Groq LLM for intelligent parsing and validation
    
    Args:
        file: CCCD image file (JPEG, PNG, JPG)
    
    Returns:
        CCCDResponse with extracted fields and confidence scores
    
    Example:
        curl -X POST "http://localhost:8000/api/v1/ocr/read-cccd" \\
             -F "file=@cccd.jpg"
    """
    
    # 1. Validate file format
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400, 
            detail="Chỉ chấp nhận file ảnh (jpg, png). Vui lòng kiểm tra lại định dạng file."
        )
    
    try:
        # 2. Read file bytes
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="File ảnh rỗng hoặc bị lỗi")
        
        # 3. Convert to numpy array
        image_array = decode_image(file_bytes)
        
        if image_array is None:
            raise HTTPException(
                status_code=400, 
                detail="Không thể đọc file ảnh. Vui lòng kiểm tra file có bị hỏng không."
            )
        
        # 4. Call CCCD extraction service
        result = extract_cccd_info(image_array)
        
        # 5. Build response with appropriate message
        if result["success"]:
            return CCCDResponse(
                success=True,
                data=result["data"],
                ocr_confidence=result["data"].get("overall_confidence", 0.8) if result["data"] else 0.0,
                raw_text=None,  # Don't expose raw text in production for privacy
                error=None,
                message="Đọc thông tin CCCD thành công"
            )
        else:
            return CCCDResponse(
                success=False,
                data=None,
                ocr_confidence=0.0,
                raw_text=None,
                error=result.get("error", "Unknown error"),
                message="Không thể trích xuất thông tin CCCD. Vui lòng kiểm tra chất lượng ảnh."
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in CCCD endpoint: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Lỗi server khi xử lý CCCD: {str(e)}"
        )
