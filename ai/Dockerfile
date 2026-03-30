# Sử dụng Python bản nhẹ (slim) để tiết kiệm dung lượng
FROM python:3.10-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file requirements và cài đặt thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào trong container
COPY . .

# Mở port 8080 (Port phổ biến cho Render)
EXPOSE 8080

# Lệnh để chạy app
# Lưu ý: app.main:app nghĩa là tìm file main.py trong folder app, và biến app bên trong đó
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]