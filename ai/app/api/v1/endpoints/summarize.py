# app/api/v1/endpoints/summarize.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, Union
from app.models.schemas import SummarizeResponse
from app.services.llm_service import summarize_to_json
from app.services.file_service import parse_file_to_text

router = APIRouter()

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(
    file: Union[UploadFile, None] = File(None), # File là tùy chọn
    text: Union[str, None] = Form(None)         # Text nhập tay cũng tùy chọn
):
    """
    API nhận vào File (PDF/DOCX/Ảnh) hoặc Text dán trực tiếp để tóm tắt.
    """
    final_content = ""

    # 1. Nếu có file upload, ưu tiên đọc file
    if file:
        file_text = await parse_file_to_text(file)
        if file_text:
            final_content += file_text + "\n"
    
    # 2. Nếu có text nhập tay, nối thêm vào
    if text:
        final_content += text

    # 3. Kiểm tra rỗng
    if len(final_content.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Không tìm thấy nội dung để tóm tắt. Vui lòng upload file chứa chữ hoặc nhập văn bản."
        )
    
    # 4. Gọi AI xử lý (Logic cũ giữ nguyên)
    # Vì file đọc ra có thể rất dài, AI sẽ tự lo việc lọc ý chính
    events_result = summarize_to_json(final_content)
    
    return SummarizeResponse(
        events=events_result,
        original_length=len(final_content),
        status="success"
    )