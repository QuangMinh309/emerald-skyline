# Stage 1: Build
# Sử dụng Node 22 bản nhẹ (alpine)
FROM node:22-alpine AS builder
# Đặt thư mục làm việc bên trong container
WORKDIR /app
# Copy file định nghĩa thư viện trước để tận dụng cache của Docker
COPY package*.json ./
# Cài đặt toàn bộ thư viện (bao gồm cả devDependencies để build)
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run
# Dùng một image Node mới
FROM node:22-alpine
WORKDIR /app
# Chỉ copy những thứ cần thiết từ giai đoạn Build sang
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
# Chỉ cài đặt các thư viện cần để chạy (loại bỏ devDependencies)
RUN npm ci --only=production
# Render sẽ "bơm" port vào đây
EXPOSE 3000
# Lệnh khởi động Backend
CMD ["node", "dist/main"]