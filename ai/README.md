# Emerald AI - Apartment Management AI Module

Module AI cho hệ thống quản lý chung cư, cung cấp các tính năng xử lý hình ảnh và nhận diện văn bản (OCR).

## ✨ Tính Năng

- **OCR Công Tơ Mét**: Tự động đọc và trích xuất chỉ số công tơ điện nước từ hình ảnh
- **FastAPI Service**: API RESTful để xử lý các yêu cầu AI
- **PaddleOCR Integration**: Sử dụng PaddleOCR cho nhận diện văn bản chính xác
- **CCCD Recognition**: Nhận diện thông tin từ CCCD Việt Nam sử dụng YOLO + LLM

## 📋 Yêu Cầu

- Python 3.8+
- pip (Python package manager)

## 🚀 Cài Đặt & Chạy

### 1. Tạo Virtual Environment

```bash
python -m venv venv
```

### 2. Kích Hoạt Virtual Environment

**Windows:**

```bash
.\venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

### 3. Cài Đặt Dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình biến môi trường

```bash
cp .env.example .env
# Edit .env với GROQ_API_KEY của bạn
```

### 5. Chạy Service

```bash
python -m app/main.py
```

Service sẽ chạy tại `http://localhost:8000`

## 📚 API Documentation

Sau khi chạy service, bạn có thể truy cập:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Endpoints

#### 1. Health Check

```
GET /
```

Kiểm tra trạng thái service.

**Response:**

```json
{
  "status": "AI Service is running"
}
```

#### 2. OCR Công Tơ Mét

```
POST /api/v1/ocr/read-meter
```

Trích xuất chỉ số công tơ từ hình ảnh.

**Request:**

- Body: Form Data
  - `file`: Hình ảnh (JPEG, PNG, JPG)

**Response (Thành công):**

```json
{
  "success": true,
  "data": {
    "index": 12345.67,
    "raw_text": "12345.67"
  }
}
```

#### 3. OCR CCCD

```
POST /api/v1/ocr/read-cccd
```

Trích xuất thông tin từ ảnh CCCD.

**Request:**

- Body: Form Data
  - `file`: Hình ảnh CCCD (JPEG, PNG, JPG)

#### 4. Summarize Text/File

```
POST /api/v1/ai/summarize
```

Tóm tắt văn bản hoặc file thành events.

## 📁 Cấu Trúc Project

```
ai/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/v1/
│   │   ├── router.py        # API router
│   │   └── endpoints/       # API endpoints
│   ├── core/config.py       # Settings
│   ├── models/schemas.py    # Pydantic schemas
│   └── services/            # Business logic
├── best.pt                  # YOLO model weights
├── data.yaml                # YOLO dataset config
├── requirements.txt         # Python dependencies
├── Dockerfile               # Docker config
├── Procfile                 # Heroku deploy
├── runtime.txt              # Python version
├── README.md               # Documentation
├── DEVELOPMENT.md          # Dev notes
├── note.txt                # Quick notes
└── .gitignore              # Git ignore rules
```

## 🔧 Cách Hoạt Động

### OCR Engine

Sử dụng PaddleOCR để:

1. Quét tất cả văn bản trong hình ảnh
2. Lọc thông minh dựa trên kích thước, độ dài, confidence
3. Chọn ứng viên tốt nhất cho meter reading

### CCCD Pipeline

3-phase processing:

- Phase 1: YOLOv8 detect regions
- Phase 2: Region-specific OCR
- Phase 3: Groq LLM parse & validate

## 📝 Ghi Chú Phát Triển

- Server chạy ở chế độ `reload=True` (tự restart khi code thay đổi)
- Hỗ trợ xử lý ảnh JPEG, PNG, JPG
- Debug logs được in ra console khi xử lý OCR

## 🤝 Đóng Góp

Hãy tự do fork, tạo branch, và submit pull requests!

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

```

## 3. Hướng dẫn khởi chạy Server

Sau khi đã cài đặt xong môi trường và thư viện, chạy lệnh sau để start server:
```

python -m app/main.py

```

## 4. Cấu trúc thư mục chính

- `app/`: Chứa mã nguồn chính của ứng dụng (API routes, controllers, services).
- `ocr_engine.py`: Module xử lý logic nhận diện và bóc tách chữ từ hình ảnh.
- `requirements.txt`: Danh sách các thư viện Python mà dự án sử dụng.

---

**Lưu ý quan trọng dành cho Developer:** Mỗi lần tắt VS Code hoặc mở Terminal mới để code cho module
```
