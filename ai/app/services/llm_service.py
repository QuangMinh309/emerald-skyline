# app/services/llm_service.py
import json
from groq import Groq
from app.core.config import settings
from typing import List, Dict

client = Groq(api_key=settings.GROQ_API_KEY)

# --- CHÚ Ý TÊN HÀM Ở ĐÂY PHẢI LÀ summarize_to_json ---
def summarize_to_json(text: str) -> List[Dict]:
    """
    Hàm tóm tắt và trả về danh sách Dictionary (JSON)
    """
    if not text:
        return []

    system_prompt = """
    Bạn là một API backend xử lý dữ liệu cho ứng dụng chung cư.
    Nhiệm vụ: Trích xuất các sự kiện từ văn bản thông báo.
    
    YÊU CẦU XỬ LÝ NÂNG CAO:
    1. GOM NHÓM: Nếu văn bản nói về cùng một sự kiện nhưng chia thành nhiều bước nhỏ (ví dụ: Bảo trì thì có bước chuẩn bị, thực hiện, dọn dẹp), hãy GỘP lại thành 1 sự kiện duy nhất.
    2. LỌC THÔNG TIN: Chỉ trích xuất những sự kiện ẢNH HƯỞNG TRỰC TIẾP đến đời sống cư dân (Cúp điện, Cúp nước, Phun thuốc, Họp tổ dân phố). Bỏ qua các quyết định hành chính, thành lập ban bệ nội bộ.
    
    YÊU CẦU ĐẦU RA (JSON):
    - Format JSON bắt buộc:
      {
        "events": [
          {
            "event_name": "Tên ngắn gọn của sự kiện",
            "time": "Thời gian diễn ra (Giờ, Ngày)",
            "location": "Khu vực bị ảnh hưởng",
            "note": "Hành động cư dân cần làm (ngắn gọn)"
          }
        ]
      }
    - Nội dung tiếng Việt, không dùng Markdown.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Văn bản nguồn:\n{text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"} 
        )
        
        raw_content = chat_completion.choices[0].message.content
        parsed_data = json.loads(raw_content)
        
        return parsed_data.get("events", [])

    except json.JSONDecodeError:
        print("Lỗi: AI không trả về JSON hợp lệ.")
        return []
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")
        return []