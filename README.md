# Emerald Skyline

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br>

**Emerald Skyline** là giải pháp công nghệ toàn diện phục vụ công tác **quản lý và vận hành chuỗi căn hộ chung cư**.  
Hệ thống được thiết kế để tự động hóa các quy trình nghiệp vụ phức tạp, hoạt động đồng bộ trên hai nền tảng:

- **Web Admin** → Dành cho Ban quản lý, kỹ thuật viên  
- **Mobile App** → Dành cho cư dân  

---

## Tính năng nổi bật

- **Quản lý hạ tầng & nhân khẩu**  
  Số hóa toàn bộ hồ sơ lưu trú, quản lý chi tiết cấu trúc tòa nhà → tầng → căn hộ.  
  Định danh rõ ràng mối quan hệ: chủ hộ – thành viên – người thuê.  
  Hệ thống phân quyền chặt chẽ theo vai trò (Ban quản lý / Kỹ thuật viên / Cư dân).

- **AI - Tự động đọc chỉ số công tơ**  
  Sử dụng **PaddleOCR** để trích xuất và xác thực chỉ số điện/nước từ ảnh chụp công tơ.  
  Giảm tối đa thao tác nhập liệu thủ công, tăng độ chính xác và tiết kiệm thời gian.

- **Tự động hóa tài chính & hóa đơn**  
  Tự động tạo hóa đơn hàng tháng khi cập nhật chỉ số mới.  
  Tính toán linh hoạt:  
  - Điện/nước theo bậc thang lũy tiến  
  - Phí dịch vụ theo m²  
  - Tự động cộng VAT và các khoản khác

- **Thanh toán & Báo cáo**  
  Tích hợp cổng thanh toán phổ biến: **Momo**, **VNPay**,...  
  Báo cáo trực quan: doanh thu, công nợ, tình hình thanh toán theo thời gian thực.

- **Quy trình xử lý sự cố khép kín**  
  Cư dân tạo phiếu phản ánh + đính kèm ảnh ngay trên app.  
  Kỹ thuật viên nhận, cập nhật tiến độ → cư dân đánh giá chất lượng → theo dõi realtime.

- **Tra cứu thông tin siêu nhanh**  
  Tìm kiếm cư dân theo: họ tên, CCCD, số điện thoại  
  Tìm kiếm căn hộ theo: tòa nhà, tầng, số căn  
  Tra cứu lịch sử hóa đơn, công nợ chi tiết

---

## Công nghệ & Kiến trúc

Hệ thống được xây dựng theo kiến trúc **Microservices** hiện đại, giao tiếp qua **RESTful API**, đảm bảo dễ mở rộng và bảo trì.

```
emerald_web_fe
  ├── Công nghệ: ReactJS + Vite + Tailwind CSS
  └── Chức năng: Giao diện Web Admin cho Ban quản lý

emerald-be
  ├── Công nghệ: NestJS + TypeORM + PostgreSQL
  └── Chức năng: Backend chính, logic nghiệp vụ & Database

Emerald-Tower_mobile_fe
  ├── Công nghệ: React Native + Expo
  └── Chức năng: Ứng dụng di động cho cư dân

emerald-ai
  ├── Công nghệ: Python + Flask + PaddleOCR
  └── Chức năng: AI xử lý ảnh công tơ (OCR)
```