import { Notification, NotiType } from '@/types/notification';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Lịch bảo trì thang máy',
    content: `Kính gửi quý cư dân,

Ban Quản Lý xin thông báo:

🔧 Thang máy số: ..........................
⏰ Thời gian bảo trì: Từ ........ ngày ........ đến ........ ngày ........
📍 Khu vực: ..............................

Trong thời gian trên, thang máy sẽ tạm ngưng hoạt động để kiểm tra và bảo trì định kỳ nhằm đảm bảo an toàn cho cư dân khi sử dụng.

Quý cư dân vui lòng đi chuyển bằng thang máy khác hoặc cầu thang bộ trong thời gian bảo trí.

Chúng tôi xin lỗi vì sự bất tiện này và rất mong nhận được sự thông cảm.

Trân trọng,`,
    type: NotiType.MAINTENANCE,
    is_urgent: false,
    created_at: '2026-01-10T06:17:39Z',
    updated_at: '2026-01-10T06:17:39Z',
    file_urls: ['https://example.com/files/qs13.pdf'],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
    ],
    channels: ['APP', 'EMAIL'],
    is_read: false,
  },
  {
    id: 2,
    title: 'Thông báo cập nhật chính sách mới',
    content: `Kính gửi quý cư dân,

Ban Quản Lý xin thông báo về việc cập nhật một số chính sách quản lý tòa nhà có hiệu lực từ ngày 15/01/2025:

• Chính sách giữ xe mới
• Quy định về giờ hoạt động hồ bơi
• Thay đổi về phí dịch vụ

Chi tiết xem tại file đính kèm.

Trân trọng,`,
    type: NotiType.POLICY,
    is_urgent: true,
    created_at: '2025-01-09T14:30:00Z',
    updated_at: '2025-01-09T14:30:00Z',
    file_urls: ['https://example.com/files/policy_2025.pdf'],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
      { id: 3, name: 'Tòa C' },
    ],
    channels: ['APP', 'EMAIL'],
    is_read: true,
  },
  {
    id: 3,
    title: 'Thông báo nghỉ lễ Tết Nguyên Đán',
    content: `Kính gửi quý cư dân,

Nhân dịp Tết Nguyên Đán 2025, Ban Quản Lý xin thông báo lịch nghỉ lễ như sau:

📅 Thời gian: Từ 28/01/2025 đến 02/02/2025
🏢 Văn phòng BQL: Đóng cửa
📞 Hotline khẩn cấp: 1900xxxx (hoạt động 24/7)

Chúc quý cư dân và gia đình một năm mới an khang, thịnh vượng!

Trân trọng,`,
    type: NotiType.GENERAL,
    is_urgent: false,
    created_at: '2025-01-08T09:00:00Z',
    updated_at: '2025-01-08T09:00:00Z',
    file_urls: [],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
    ],
    channels: ['APP'],
    is_read: true,
  },
  {
    id: 4,
    title: 'CẢNH BÁO: Xuất hiện người lạ trong tòa nhà',
    content: `⚠️ CẢNH BÁO KHẨN CẤP

Vào lúc 15:30 ngày 10/01/2025, camera an ninh phát hiện người lạ mặt di chuyển tại tầng 15 Tòa A.

Đặc điểm:
• Nam, cao khoảng 1m70
• Áo đen, quần jean
• Không có thẻ cư dân

Quý cư dân lưu ý:
1. Khóa cửa cẩn thận
2. Không mở cửa cho người lạ
3. Liên hệ bảo vệ: 0909xxxxxx nếu phát hiện

Ban Quản Lý đang phối hợp công an xử lý.

Trân trọng,`,
    type: NotiType.WARNING,
    is_urgent: true,
    created_at: '2025-01-10T15:45:00Z',
    updated_at: '2025-01-10T15:45:00Z',
    file_urls: [],
    target_blocks: [{ id: 1, name: 'Tòa A' }],
    channels: ['APP', 'EMAIL'],
    is_read: false,
  },
  {
    id: 5,
    title: 'Thông báo kiểm tra hệ thống điện',
    content: `Kính gửi quý cư dân,

Ngày 15/01/2025, từ 8:00 - 12:00, đơn vị điện lực sẽ tiến hành kiểm tra hệ thống điện toàn tòa nhà.

Trong thời gian này có thể xảy ra mất điện tạm thời.

Quý cư dân vui lòng chuẩn bị trước.

Trân trọng,`,
    type: NotiType.MAINTENANCE,
    is_urgent: false,
    created_at: '2025-01-07T10:00:00Z',
    updated_at: '2025-01-07T10:00:00Z',
    file_urls: [],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
    ],
    channels: ['APP'],
    is_read: true,
  },
  {
    id: 6,
    title: 'Quy định mới về vệ sinh chung',
    content: `Kính gửi quý cư dân,

Từ ngày 01/02/2025, áp dụng quy định mới về vệ sinh khu vực chung:

• Không để giày dép ngoài hành lang
• Phân loại rác đúng quy định
• Giữ gìn vệ sinh thang máy

Mọi vi phạm sẽ bị nhắc nhở và xử phạt theo quy định.

Trân trọng,`,
    type: NotiType.POLICY,
    is_urgent: false,
    created_at: '2025-01-06T16:20:00Z',
    updated_at: '2025-01-06T16:20:00Z',
    file_urls: ['https://example.com/files/hygiene_rules.pdf'],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
      { id: 3, name: 'Tòa C' },
    ],
    channels: ['APP', 'EMAIL'],
    is_read: true,
  },
];
