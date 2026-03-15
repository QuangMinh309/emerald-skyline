export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
	id: number;
	code: string;

	serviceId: number;

	customerName: string;
	customerPhone: string;

	bookingDate: string; // "YYYY-MM-DD"
	unitPrice: number;
	totalPrice: number;

	receiveDate?: string;
	checkIn?: string; // "HH:mm"
	checkOut?: string; // "HH:mm"

	status: BookingStatus;
	createdAt?: string;
}
