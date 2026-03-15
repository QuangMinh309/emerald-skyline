// src/types/service.ts

export type ServiceType = "NORMAL" | "COMMUNITY";
export type ServiceStatus = "active" | "inactive"; // nếu hệ thống bạn có
export type BookingStatus =
	| "PAID"
	| "PENDING"
	| "CANCELLED"
	| "CONFIRMED"
	| "EXPIRED";
export interface BookingTimestamp {
	startTime: string; // "06:00"
	endTime: string; // "07:00"
}

export interface BookingHistoryItem {
	id: number;
	code: string; // "BKG-20260118-007"
	residentName: string;
	phoneNumber: string;
	bookingDate: string; // "2026-01-18" (yyyy-mm-dd)
	unitPrice: number;
	timestamps: BookingTimestamp[];
	totalPrice: number;
	status: BookingStatus;
	statusLabel?: string; // "Đã thanh toán"
	createdAt: string; // ISO string
}

export interface BookingRow extends BookingTimestamp {
	id: string;
	bookingId: number;
	code: string;
	residentName: string;
	phoneNumber: string;
	bookingDate: string;
	unitPrice: number;
	totalPrice: number;
	status: string;
	statusLabel?: string;
	createdAt: string;
	slotIndex: number;
}

export interface Service {
	id: number;
	name: string; // BBQ, Hồ bơi, Tennis
	description?: string;
	openHour: string; // time, ví dụ "08:00"
	closeHour: string; // time
	imageUrl?: string;
	unitPrice: number;
	unitTimeBlock: number; // block tính tiền: 30/60 phút
	totalSlot: number;
	createdAt?: string; // timestamp (ISO string)
	type?: ServiceType; // default NORMAL
	status: ServiceStatus; // thêm trạng thái dịch vụ
	bookingHistory?: BookingHistoryItem[];
}
