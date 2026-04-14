import {
  Booking,
  BookingStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Service,
  ServiceType,
  SlotAvailability,
} from '@/types/service';

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    name: 'Sân Tennis',
    description:
      'Câm 4 sân 2 sân ngoài trời và 2 sân trong nhà. Không gian rộng rãi, có hỗ trợ mượn vợt và bóng',
    open_hour: '06:00',
    close_hour: '22:00',
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    unit_price: 50000,
    unit: 30,
    total_slot: 4,
    created_at: '2025-01-01T00:00:00Z',
    type: ServiceType.NORMAL,
    category: 'Thể thao, giải trí',
  },
  {
    id: 2,
    name: 'Sân Cầu Lông',
    description: '4 sân cầu lông trong nhà, có điều hòa, cho thuê vợt',
    open_hour: '06:00',
    close_hour: '22:00',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    unit_price: 30000,
    unit: 60,
    total_slot: 4,
    created_at: '2025-01-01T00:00:00Z',
    type: ServiceType.NORMAL,
    category: 'Thể thao, giải trí',
  },
  {
    id: 3,
    name: 'Sân Bóng Đá',
    description: 'Sân bóng cỏ nhân tạo 5v5 và 7v7',
    open_hour: '06:00',
    close_hour: '22:00',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    unit_price: 60000,
    unit: 90,
    total_slot: 2,
    created_at: '2025-01-01T00:00:00Z',
    type: ServiceType.NORMAL,
    category: 'Thể thao, giải trí',
  },
  {
    id: 4,
    name: 'Khu BBQ',
    description: 'Khu nướng BBQ ngoài trời, đầy đủ tiện nghi',
    open_hour: '10:00',
    close_hour: '22:00',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    unit_price: 30000,
    unit: 60,
    total_slot: 1,
    created_at: '2025-01-01T00:00:00Z',
    type: ServiceType.NORMAL,
    category: 'Tổ chức hoạt động',
  },
  {
    id: 5,
    name: 'Phòng Sinh Hoạt',
    description: 'Phòng sinh hoạt chung với máy chiếu, âm thanh',
    open_hour: '08:00',
    close_hour: '22:00',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    unit_price: 0,
    unit: 120,
    total_slot: 1,
    created_at: '2025-01-01T00:00:00Z',
    type: ServiceType.COMMUNITY,
    category: 'Tổ chức hoạt động',
  },
];

export function getMockSlotAvailability(
  serviceId: number,
  date: string
): SlotAvailability[] {
  const service = MOCK_SERVICES.find((s) => s.id === serviceId);
  if (!service) return [];

  const slots: SlotAvailability[] = [];
  let id = 1;

  const [startH, startM] = service.open_hour.split(':').map(Number);
  const [endH, endM] = service.close_hour.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + service.unit <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    const endMinutesSlot = currentMinutes + service.unit;
    const endHours = Math.floor(endMinutesSlot / 60);
    const endMinutesRem = endMinutesSlot % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutesRem
      .toString()
      .padStart(2, '0')}`;

    const remaining = Math.floor(Math.random() * (service.total_slot + 1));

    slots.push({
      id: id++,
      service_id: serviceId,
      start_time: startTime,
      end_time: endTime,
      remaining_slot: remaining,
    });

    currentMinutes += service.unit;
  }

  return slots;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    code: 'DV-TN-001-023',
    customer_id: 1,
    customer_name: 'Nguyễn Lưu Ly',
    customer_phone: '0912345678',
    service_id: 1,
    service_name: 'Sân Tennis',
    date: '2025-01-27',
    timestamps: [
      {
        startTime: '15:00',
        endTime: '17:00',
      },
    ],
    unit_price: 50000,
    total: 200000,
    created_at: '2025-01-10T10:00:00Z',
    status: BookingStatus.PAID,
    paid_at: '2025-01-27T13:39:45Z',
    apartment: 'A12.05',
  },
  {
    id: 2,
    code: 'DV-TN-001-024',
    customer_id: 1,
    customer_name: 'Nguyễn Lưu Ly',
    customer_phone: '0912345678',
    service_id: 1,
    service_name: 'Sân Tennis',
    date: '2025-01-28',
    timestamps: [
      {
        startTime: '15:00',
        endTime: '17:00',
      },
    ],
    unit_price: 50000,
    total: 200000,
    created_at: '2025-01-10T10:05:00Z',
    status: BookingStatus.PENDING,
    apartment: 'A12.05',
  },
  {
    id: 3,
    code: 'DV-TN-001-025',
    customer_id: 1,
    customer_name: 'Nguyễn Lưu Ly',
    customer_phone: '0912345678',
    service_id: 2,
    service_name: 'Sân Cầu Lông',
    date: '2025-01-20',
    timestamps: [
      {
        startTime: '18:00',
        endTime: '20:00',
      },
    ],
    unit_price: 30000,
    total: 60000,
    created_at: '2025-01-05T10:00:00Z',
    status: BookingStatus.EXPIRED,
    apartment: 'A12.05',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    booking_id: 1,
    amount: 200000,
    status: PaymentStatus.SUCCESS,
    method: PaymentMethod.VNPAY,
    paid_at: '2025-01-27T13:39:45Z',
  },
];
