export enum ServiceType {
  NORMAL = 'NORMAL',
  COMMUNITY = 'COMMUNITY',
}

export enum BookingStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum PaymentMethod {
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export interface Service {
  id: number;
  name: string;
  description: string;
  open_hour: string; // "08:00"
  close_hour: string; // "22:00"
  url: string; // Image URL
  unit_price: number;
  unit: number; // Minutes: 30, 60, 90, 120
  total_slot: number;
  created_at: string;
  type: ServiceType;
  category?: string; // Client-side grouping
}

export interface SlotAvailability {
  id: string | number;
  service_id: number;
  start_time: string; // "15:00"
  end_time: string; // "16:00"
  remaining_slot: number;
}

export interface Booking {
  id: number;
  code: string; // Auto-generated code
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  service_id: number;
  service_name?: string;
  date: string; // ISO date
  timestamps: {
    startTime?: string;
    endTime?: string;
    start?: string;
    end?: string;
  }[];
  unit_price: number;
  total: number;
  created_at: string;
  status: BookingStatus;
  paid_at?: string;
  expiresAt?: string | null;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paid_at?: string;
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.PAID]: 'Đã thanh toán',
    [BookingStatus.PENDING]: 'Cần thanh toán',
    [BookingStatus.CANCELLED]: 'Đã hủy',
    [BookingStatus.EXPIRED]: 'Đã quá hạn',
  };
  return labels[status];
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    [BookingStatus.PAID]: '#10B981', // Green
    [BookingStatus.PENDING]: '#F59E0B', // Orange
    [BookingStatus.CANCELLED]: '#EF4444', // Red
    [BookingStatus.EXPIRED]: '#6B7280', // Gray
  };
  return colors[status];
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.MOMO]: 'Momo',
    [PaymentMethod.VNPAY]: 'VNPay',
  };
  return labels[method];
}
