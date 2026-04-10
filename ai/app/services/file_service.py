# app/services/file_service.py
from fastapi import UploadFile, HTTPException
import io
from pypdf import PdfReader
from docx import Document
from app.services.ocr_service import decode_image, extract_text_from_image

async def parse_file_to_text(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = await file.read()
    file_stream = io.BytesIO(content)
    
    extracted_text = ""

    # 1. Xử lý PDF
    if filename.endswith(".pdf"):
        try:
            reader = PdfReader(file_stream)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            print(f"Lỗi đọc PDF: {e}")

    # 2. Xử lý Word (.docx)
    elif filename.endswith(".docx"):
        try:
            doc = Document(file_stream)
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        except Exception as e:
             print(f"Lỗi đọc DOCX: {e}")

    # 3. Xử lý Ảnh (JPG, PNG, JPEG) -> Gọi sang OCR Service
    elif filename.endswith((".jpg", ".jpeg", ".png")):
        try:
            image_array = decode_image(content)
            extracted_text = extract_text_from_image(image_array)
        except Exception as e:
             print(f"Lỗi đọc Ảnh: {e}")
             
    # 4. Xử lý Text thuần (.txt)
    elif filename.endswith(".txt"):
        extracted_text = content.decode("utf-8")
        
    else:
        raise HTTPException(status_code=400, detail="Định dạng file không hỗ trợ (chỉ nhận PDF, DOCX, Ảnh, TXT)")

    return extracted_text.strip()