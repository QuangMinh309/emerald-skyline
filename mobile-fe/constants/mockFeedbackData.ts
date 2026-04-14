import { Feedback, FeedbackStatus, IssueType } from '@/types/feedback';

export const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 1,
    code: '#PA0323',
    resident_id: 1,
    resident_name: 'Nguyễn Lưu Ly',
    apartment: 'Tòa A - 12.05',
    title: 'Thang máy Block B dừng đột ngột giữa chừng',
    description:
      'Tôi mới bị kẹt trong thang máy số 2 Block B lúc 14h hôm nay. Thang máy dừng giữa tầng 10 và 11 trong khoảng 20 phút. Đèn trong thang vẫn sáng nhưng không thể mở cửa. Sau đó thang tự hạ xuống tầng 9 và cửa mở. Tôi lo ngại về an toàn cho cư dân khác.',
    type: IssueType.TECHNICAL,
    location: {
      building: 'Tòa A',
      floor: 12,
      room: '301',
    },
    images: [
      {
        id: 1,
        feedback_id: 1,
        url: 'https://images.unsplash.com/photo-1619994737701-c464936c4f28?w=800',
        uploaded_at: '2025-01-10T14:30:00Z',
      },
    ],
    status: FeedbackStatus.IN_PROGRESS,
    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-10T15:00:00Z',
    response: 'Ban Quản Lý đã tiếp nhận và sẽ kiểm tra trong vòng 24h',
    is_urgent: true,
    estimated_completion_date: '2025-01-12T17:00:00Z',
  },
  {
    id: 2,
    code: '#PA0322',
    resident_id: 1,
    resident_name: 'Nguyễn Lưu Ly',
    apartment: 'Tòa A - 12.05',
    title: 'Thang máy Block B dừng đột ngột giữa chừng',
    description: 'Thang máy Block B tầng 15 bị kẹt, đèn không sáng',
    type: IssueType.TECHNICAL,
    location: {
      building: 'Tòa A',
      floor: 15,
    },
    images: [],
    status: FeedbackStatus.RESOLVED,
    created_at: '2025-01-08T09:00:00Z',
    updated_at: '2025-01-09T16:00:00Z',
    resolved_at: '2025-01-09T16:00:00Z',
    response: 'Đã kiểm tra và sửa chữa xong. Thang máy hoạt động bình thường.',
    is_urgent: false,
  },
  {
    id: 3,
    code: '#PA0321',
    resident_id: 1,
    resident_name: 'Nguyễn Lưu Ly',
    apartment: 'Tòa A - 12.05',
    title: 'Tiếng ồn từ căn hộ bên cạnh',
    description:
      'Căn hộ 12.06 thường xuyên phát ra tiếng ồn lớn vào ban đêm, ảnh hưởng đến giấc ngủ',
    type: IssueType.NOISE,
    location: {
      building: 'Tòa A',
      floor: 12,
      room: '305',
    },
    images: [],
    status: FeedbackStatus.PENDING,
    created_at: '2025-01-09T22:00:00Z',
    updated_at: '2025-01-09T22:00:00Z',
    is_urgent: false,
  },
  {
    id: 4,
    code: '#PA0320',
    resident_id: 1,
    resident_name: 'Nguyễn Lưu Ly',
    apartment: 'Tòa A - 12.05',
    title: 'Hệ thống nước nóng không hoạt động',
    description: 'Nước nóng trong phòng tắm không chảy từ sáng nay',
    type: IssueType.TECHNICAL,
    location: {
      building: 'Tòa A',
      floor: 12,
      room: '301',
    },
    images: [],
    status: FeedbackStatus.RESOLVED,
    created_at: '2025-01-07T06:30:00Z',
    updated_at: '2025-01-07T14:00:00Z',
    resolved_at: '2025-01-07T14:00:00Z',
    response: 'Đã thay bình nóng lạnh mới',
    rating: 4,
    is_urgent: true,
  },
];

export const BUILDINGS = ['Tòa A', 'Tòa B', 'Tòa C'];
export const FLOORS = Array.from({ length: 30 }, (_, i) => i + 1); // 1-30
export const ROOMS = Array.from({ length: 10 }, (_, i) => `${i + 1}01`); // 101, 201, ...
