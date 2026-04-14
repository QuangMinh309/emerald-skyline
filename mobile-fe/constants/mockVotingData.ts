import { Voting, VotingStatus } from '@/types/voting';

export function getVotingStatus(
  startTime: string,
  endTime: string
): VotingStatus {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return 'upcoming';
  if (now > end) return 'closed';
  return 'ongoing';
}

export const MOCK_VOTINGS: Voting[] = [
  {
    id: 1,
    title: 'Biểu quyết: Cải tạo sảnh chính của tòa nhà',
    content: `Kính gửi quý cư dân,

Ban Quản Lý xin xuất cái tạo sảnh chính của tòa nhà nhằm:
• Tăng tính thẩm mỹ chung
• Cải thiện trải nghiệm ra/vào cho cư dân
• Thay thế tài liệu cũ đã xuống cấp

Để đảm bảo quyết định được đưa ra dựa trên ý kiến tập thể, cư dân được mời tham gia biểu quyết theo các phương án dưới đây.`,
    is_required: true,
    start_time: '2026-01-05T00:00:00Z',
    end_time: '2026-01-15T23:59:59Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    file_urls: [],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
    ],
    options: [
      {
        id: 1,
        voting_id: 1,
        name: 'Phương án A: Cải tạo cơ bản',
        description: `• Sơn lại tường
• Thay đèn chiếu sáng LED hiện đại
• Vệ sinh + sửa chữa nền
• Chi phí dự kiến: 280 triệu VNĐ`,
        vote_count: 45,
      },
      {
        id: 2,
        voting_id: 1,
        name: 'Phương án B: Cải tạo nâng cấp',
        description: `• Toàn bộ phương án A
• Bổ sung màn hình giải trí khu lobby
• Trang trí cây xanh
• Chi phí dự kiến: 280 triệu VNĐ`,
        vote_count: 30,
      },
      {
        id: 3,
        voting_id: 1,
        name: 'Phương án C: Không cải tạo',
        description: `• Giữ nguyên hiện trạng
• Chỉ bảo trì khi có hỏng hóc
• Chi phí dự kiến: 0 VNĐ`,
        vote_count: 10,
      },
    ],
  },
  {
    id: 2,
    title: 'Biểu quyết: Nâng cấp hệ thống an ninh',
    content: `Kính gửi quý cư dân,

Nhằm tăng cường an ninh cho toàn thể cư dân, Ban Quản Lý đề xuất nâng cấp hệ thống camera và kiểm soát ra vào.`,
    is_required: false,
    start_time: '2026-01-20T00:00:00Z',
    end_time: '2026-01-30T23:59:59Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    file_urls: [],
    target_blocks: [{ id: 1, name: 'Tòa A' }],
    options: [
      {
        id: 4,
        voting_id: 2,
        name: 'Đồng ý nâng cấp',
        description: 'Chi phí: 500 triệu VNĐ',
        vote_count: 0,
      },
      {
        id: 5,
        voting_id: 2,
        name: 'Không đồng ý',
        description: 'Giữ nguyên hiện trạng',
        vote_count: 0,
      },
    ],
  },
  {
    id: 3,
    title: 'Biểu quyết: Thay đổi giờ vận hành hồ bơi',
    content: `Đề xuất thay đổi giờ mở cửa hồ bơi từ 6h-22h sang 5h-23h.`,
    is_required: false,
    start_time: '2024-12-20T00:00:00Z',
    end_time: '2024-12-31T23:59:59Z',
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z',
    file_urls: [],
    target_blocks: [
      { id: 1, name: 'Tòa A' },
      { id: 2, name: 'Tòa B' },
    ],
    options: [
      {
        id: 6,
        voting_id: 3,
        name: 'Đồng ý',
        description: '',
        vote_count: 120,
      },
      {
        id: 7,
        voting_id: 3,
        name: 'Không đồng ý',
        description: '',
        vote_count: 80,
      },
    ],
  },
];

export const MOCK_VOTINGS_WITH_STATUS = MOCK_VOTINGS.map((voting) => ({
  ...voting,
  status: getVotingStatus(voting.start_time, voting.end_time),
}));
