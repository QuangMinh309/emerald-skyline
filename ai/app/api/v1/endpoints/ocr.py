# app/api/v1/endpoints/ocr.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import extract_meter_reading, decode_image
from app.models.schemas import OCRResponse

router = APIRouter()

@router.post("/read-meter", response_model=OCRResponse)
async def read_meter(file: UploadFile = File(...)):
    # 1. Validate định dạng file
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh (jpg, png)")
    
    try:
        # 2. Đọc bytes từ file upload
        file_bytes = await file.read()
        
        # 3. Convert sang numpy array
        image_array = decode_image(file_bytes)
        
        if image_array is None:
             raise HTTPException(status_code=400, detail="File ảnh bị lỗi, không đọc được")

        # 4. Gọi thuật toán OCR của bạn
        result_text = extract_meter_reading(image_array)
        
        if result_text:
            return OCRResponse(
                meter_reading=result_text, 
                status="success", 
                message="Đọc chỉ số thành công"
            )
        else:
            return OCRResponse(
                meter_reading=None, 
                status="failed", 
                message="Không tìm thấy chỉ số điện trong ảnh"
            )

    except Exception as e:
        print(f"Lỗi API OCR: {e}")
        raise HTTPException(status_code=500, detail="Lỗi Server khi xử lý ảnh")