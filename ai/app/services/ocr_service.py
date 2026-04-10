# app/services/ocr_service.py
from paddleocr import PaddleOCR
import numpy as np
import re
import cv2 # Thư viện xử lý ảnh

# Khởi tạo model 1 lần duy nhất khi chạy server để tiết kiệm RAM
ocr_model = PaddleOCR(use_angle_cls=True, lang='en')

def decode_image(file_bytes):
    """
    Chuyển bytes từ file upload thành numpy array cho PaddleOCR
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def extract_meter_reading(image_array):
    """
    Logic OCR với xử lý loại bỏ check digit (chữ số kiểm tra)
    - Công tơ điện/nước thường có 5 chữ số chính + 1 check digit
    - Check digit thường ở cuối, có màu/kích thước khác
    """
    try:
        # PaddleOCR nhận vào numpy array
        result = ocr_model.ocr(image_array, cls=True)
        
        if not result or result[0] is None:
            return None

        candidates = []
        max_height = 0
        max_conf = 0

        # --- BƯỚC 1: QUÉT TEXT ---
        for line in result[0]:
            box = line[0]
            text = line[1][0]
            conf = line[1][1]

            height = box[3][1] - box[0][1]
            if height > max_height:
                max_height = height
            
            if conf > max_conf:
                max_conf = conf

            clean_text = text.upper().replace('O', '0')
            clean_text = re.sub(r'[^0-9.]', '', clean_text)

            if len(clean_text) > 0:
                # Lưu thêm tọa độ để tính toán vị trí
                x_center = (box[0][0] + box[1][0]) / 2
                candidates.append({
                    "text": clean_text,
                    "height": height,
                    "conf": conf,
                    "x_center": x_center,
                    "box": box
                })

        # --- BƯỚC 2: LỌC HEURISTIC ---
        final_list = []
        for item in candidates:
            # Luật 1: Chiều cao > 50% max_height
            if item['height'] < (max_height * 0.5):
                continue
            
            # Luật 2: Độ dài >= 3
            if len(item['text']) < 3:
                continue

            final_list.append(item)

        if not final_list:
            return None

        # --- BƯỚC 3: CHỌN BEST CANDIDATE ---
        final_list.sort(key=lambda x: ('.' in x['text'], x['height'], x['conf']), reverse=True)
        best_candidate = final_list[0]['text']
        
        # --- BƯỚC 4: LỌC CHECK DIGIT (QUAN TRỌNG!) ---
        # Check digit thường là:
        # - Chữ số cuối cùng
        # - Có thể nhỏ hơn hoặc có độ tin cậy thấp hơn
        # - Nằm ở vị trí X lệch về phải
        
        result_text = _remove_check_digit(best_candidate, final_list)
        
        return result_text

    except Exception as e:
        print(f"Lỗi OCR Service: {e}")
        return None


def _remove_check_digit(meter_text, candidates_list):
    """
    Loại bỏ check digit từ kết quả OCR - Giải pháp đơn giản & chính xác
    
    Luật: Nếu số có nhiều hơn 5 chữ số (không tính dấu chấm) → xoá chữ số cuối
    Vì công tơ tiêu chuẩn chỉ có 5 chữ số chính, số dư là check digit
    """
    # Nếu có dấu chấm, không xoá ký tự cuối (đó là phần thập phân)
    if '.' in meter_text:
        return meter_text
    
    # Đếm chỉ các chữ số (không tính dấu chấm)
    digit_only = meter_text.replace('.', '')
    
    # Nếu có > 5 chữ số → xoá chữ số cuối cùng (đó là check digit)
    if len(digit_only) > 5:
        return meter_text[:-1]
    
    # Nếu đã đúng 5 chữ số hoặc ít hơn → giữ nguyên
    return meter_text
    
def extract_text_from_image(image_array) -> str:
    """
    Hàm dùng chung: Đọc toàn bộ văn bản từ ảnh (Dùng cho tính năng Tóm tắt)
    """
    try:
        # cls=False để chạy nhanh hơn nếu không cần check ngược xuôi quá kỹ
        result = ocr_model.ocr(image_array, cls=True)
        
        if not result or result[0] is None:
            return ""

        # Nối tất cả các dòng chữ tìm được lại thành 1 đoạn văn
        full_text = []
        for line in result[0]:
            text = line[1][0]
            full_text.append(text)
            
        return "\n".join(full_text) # Trả về string text
    except Exception as e:
        print(f"Lỗi OCR Image: {e}")
        return ""