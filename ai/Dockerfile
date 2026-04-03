# Sử dụng Python bản nhẹ (slim) để tiết kiệm dung lượng
FROM python:3.10-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào trong container
COPY . .

# Mở port 8000 (đồng bộ với code)
EXPOSE 8000

# dùng PORT env của Render
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]