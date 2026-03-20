# Emerald AI Service

Đây là phân hệ xử lý Trí tuệ nhân tạo (AI) và Nhận dạng ký tự quang học (OCR) cho dự án **Emerald Skyline**. Service này được xây dựng trên nền tảng Python và Flask.

## 1. Yêu cầu hệ thống

- **Python**: Phiên bản 3.8 trở lên.

## 2. Hướng dẫn cài đặt môi trường

Thư mục môi trường ảo `venv` không được đẩy lên Git vì dung lượng quá nặng. Mỗi thành viên cần tự khởi tạo môi trường trên máy cá nhân theo các bước sau:

### Bước 1: Di chuyển vào thư mục AI
```
cd emerald-ai
```

### Bước 2: Khởi tạo môi trường ảo (Virtual Environment)
```
python -m venv venv
```

### Bước 3: Kích hoạt môi trường ảo

Bạn phải chạy lệnh tương ứng với hệ điều hành đang sử dụng:

- **Dành cho Windows**:
```
venv\Scripts\activate
```

- **Dành cho macOS / Linux**:
```
source venv/bin/activate
```

_(Dấu hiệu thành công: Xuất hiện chữ `(venv)` ở đầu dòng lệnh trong Terminal)._

### Bước 4: Cài đặt thư viện (Dependencies)

Lưu ý: Chỉ chạy lệnh này khi đã kích hoạt `venv` thành công ở Bước 3.
```
pip install -r requirements.txt
```

### Bước 5: Cấu hình biến môi trường

Tạo file `.env` (có thể copy từ `.env.example`) và điền các thông số cần thiết:
```
cp .env.example .env
```

## 3. Hướng dẫn khởi chạy Server

Sau khi đã cài đặt xong môi trường và thư viện, chạy lệnh sau để start server:
```
python app/main.py
```

Mặc định, server sẽ lắng nghe tại: `http://localhost:5000`

## 4. Cấu trúc thư mục chính

- `app/`: Chứa mã nguồn chính của ứng dụng (API routes, controllers, services).
- `ocr_engine.py`: Module xử lý logic nhận diện và bóc tách chữ từ hình ảnh.
- `requirements.txt`: Danh sách các thư viện Python mà dự án sử dụng.

---

**Lưu ý quan trọng dành cho Developer:** Mỗi lần tắt VS Code hoặc mở Terminal mới để code cho module
