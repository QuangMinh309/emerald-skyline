<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Emerald Skyline Backend API - Hệ thống quản lý chung cư hiện đại xây dựng bằng [NestJS](https://github.com/nestjs/nest), TypeORM và PostgreSQL.

### 📋 Các module chính:

- **Accounts**: Quản lý tài khoản người dùng
- **Apartments**: Quản lý căn hộ và cư dân
- **Invoices**: Quản lý hóa đơn tiền phí quản lý
- **Payments**: Xử lý thanh toán (MoMo, VNPay)
- **Maintenance Tickets**: Quản lý vé bảo trì
- **Notifications**: Hệ thống thông báo realtime
- **Reports**: Báo cáo thống kê
- **AI Service**: Tích hợp OCR cho đọc số điện nước

---

## 🚀 Quick Start

### 1️⃣ Cài đặt dependencies

```bash
# Cài đặt npm packages
npm install
```

### 2️⃣ Cấu hình environment

```bash
# Copy file .env.example thành .env (nếu chưa có)
cp .env.example .env

# Chỉnh sửa .env với credentials
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Secret key cho JWT tokens
# - CLOUDINARY_*: Cloudinary API credentials
# - SMTP_*: Email service credentials
# - MOMO_*, VNPAY_*: Payment gateway credentials
```

### 3️⃣ Chuẩn bị Database

```bash
# Chạy migrations để tạo schema
npm run m:run

# Hoặc từng bước:
npm run typeorm migration:run    # Chạy tất cả migrations
npm run typeorm migration:revert # Hoàn tác migration gần nhất
```

### 4️⃣ Chạy ứng dụng

```bash
# Development mode (auto reload khi code thay đổi)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode (attach debugger)
npm run start:debug
```

ứng dụng sẽ chạy tại: `http://localhost:4000`

---

## 🧪 Testing

### Chạy tests

```bash
# Chạy tất cả unit tests
npm run test

# Chạy test ở chế độ watch (tự động rerun khi code thay đổi)
npm run test:watch

# Chạy test với coverage report
npm run test:cov

# Debug test (attach debugger)
npm run test:debug

# Chạy end-to-end tests
npm run test:e2e
```

---

## 📚 Database Migrations

### Các lệnh migration

```bash
# Chạy tất cả pending migrations
npm run m:run

# Hoàn tác migration gần nhất
npm run m:revert

# Tạo migration mới từ thay đổi entity
npm run m:gen src/migrations/<MigrationName>

# Tạo migration rỗng (viết manual)
npm run m:create src/migrations/<MigrationName>

# TypeORM CLI trực tiếp
npm run typeorm -- <command>
```

---

## 🔨 Available Scripts

```bash
# Build
npm run build                 # Compile TypeScript

# Start
npm run start                 # Node production
npm run start:dev            # Watch mode
npm run start:debug          # Debug mode

# Database
npm run typeorm              # TypeORM CLI
npm run m:gen                # Generate migration
npm run m:create             # Create migration file
npm run m:run                # Run migrations
npm run m:revert             # Revert last migration

# Testing
npm run test                 # Jest unit tests
npm run test:watch          # Jest watch mode
npm run test:cov            # Coverage report
npm run test:debug          # Debug tests
npm run test:e2e            # E2E tests

# Code quality
npm run format              # Prettier format
```

---

## 📖 API Documentation

Swagger API docs available at: `https://emerald-skyline-beee.onrender.com/api/v1/docs`

---

## 📦 Deployment

### Docker

```bash
# Build Docker image
docker build -t emerald-be:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  emerald-be:latest
```

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js](https://www.passportjs.org)
- [Swagger/OpenAPI](https://swagger.io)

---

## License

UNLICENSED - Private project
