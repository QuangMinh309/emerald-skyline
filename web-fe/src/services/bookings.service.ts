import axiosInstance from "@/lib/axios";
import type { Booking, BookingStatus } from "@/types/booking";

const USE_MOCK = true;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockBookings: Booking[] = [
	// Service 1: Bóng bàn
	{
		id: 101,
		code: "BK-202601-0001",
		serviceId: 1,
		customerName: "Nguyễn Văn An",
		customerPhone: "0901 234 567",
		bookingDate: "2026-01-12",
		unitPrice: 70000,
		totalPrice: 140000,
		receiveDate: "2026-01-13",
		checkIn: "08:00",
		checkOut: "10:00",
		status: "PENDING",
		createdAt: "2026-01-12T03:20:00Z",
	},
	{
		id: 102,
		code: "BK-202601-0002",
		serviceId: 1,
		customerName: "Trần Thị Bình",
		customerPhone: "0987 654 321",
		bookingDate: "2026-01-12",
		unitPrice: 70000,
		totalPrice: 70000,
		receiveDate: "2026-01-13",
		checkIn: "10:00",
		checkOut: "11:00",
		status: "CONFIRMED",
		createdAt: "2026-01-12T04:10:00Z",
	},
	{
		id: 103,
		code: "BK-202601-0003",
		serviceId: 1,
		customerName: "Lê Minh Châu",
		customerPhone: "0933 222 111",
		bookingDate: "2026-01-11",
		unitPrice: 70000,
		totalPrice: 210000,
		receiveDate: "2026-01-14",
		checkIn: "14:00",
		checkOut: "17:00",
		status: "CANCELLED",
		createdAt: "2026-01-11T02:45:00Z",
	},

	// Service 2: Sân cầu lông
	{
		id: 201,
		code: "BK-202601-0101",
		serviceId: 2,
		customerName: "Phạm Quốc Dũng",
		customerPhone: "0912 999 888",
		bookingDate: "2026-01-12",
		unitPrice: 50000,
		totalPrice: 100000,
		receiveDate: "2026-01-13",
		checkIn: "18:00",
		checkOut: "20:00",
		status: "COMPLETED",
		createdAt: "2026-01-12T05:05:00Z",
	},
	{
		id: 202,
		code: "BK-202601-0102",
		serviceId: 2,
		customerName: "Võ Thị Hạnh",
		customerPhone: "0905 111 222",
		bookingDate: "2026-01-10",
		unitPrice: 50000,
		totalPrice: 50000,
		receiveDate: "2026-01-15",
		checkIn: "06:00",
		checkOut: "07:00",
		status: "PENDING",
		createdAt: "2026-01-10T01:00:00Z",
	},
];

export const getBookingsByServiceId = async (
	serviceId: number,
): Promise<Booking[]> => {
	if (USE_MOCK) {
		await sleep(200);
		return mockBookings.filter((b) => b.serviceId === serviceId);
	}

	const res = await axiosInstance.get(`/services/${serviceId}/bookings`);
	return res.data.data as Booking[];
};

export const getBookingById = async (id: number): Promise<Booking> => {
	if (USE_MOCK) {
		await sleep(200);
		const found = mockBookings.find((b) => b.id === id);
		if (!found) throw new Error("Booking not found");
		return { ...found };
	}

	const res = await axiosInstance.get(`/bookings/${id}`);
	return res.data.data as Booking;
};

export type CreateBookingInput = Omit<Booking, "id" | "createdAt" | "code"> & {
	code?: string; // mock có thể auto-generate
};

const makeCode = () => {
	// BK-YYYYMM-XXXX
	const now = new Date();
	const yyyy = String(now.getFullYear());
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const seq = String(Math.floor(Math.random() * 9000) + 1000);
	return `BK-${yyyy}${mm}-${seq}`;
};

export const createBooking = async (
	payload: CreateBookingInput,
): Promise<Booking> => {
	if (USE_MOCK) {
		await sleep(200);
		const newItem: Booking = {
			id: Math.max(0, ...mockBookings.map((b) => b.id)) + 1,
			createdAt: new Date().toISOString(),
			code: payload.code ?? makeCode(),
			...payload,
		};
		mockBookings.unshift(newItem);
		return newItem;
	}

	const res = await axiosInstance.post(`/bookings`, payload);
	return res.data.data as Booking;
};

export type UpdateBookingInput = Partial<
	Omit<Booking, "id" | "serviceId" | "code" | "createdAt">
> & {
	status?: BookingStatus;
};

export const updateBooking = async (args: {
	id: number;
	payload: UpdateBookingInput;
}): Promise<Booking> => {
	if (USE_MOCK) {
		await sleep(200);
		const idx = mockBookings.findIndex((b) => b.id === args.id);
		if (idx === -1) throw new Error("Booking not found");
		mockBookings[idx] = { ...mockBookings[idx], ...args.payload };
		return mockBookings[idx];
	}

	const res = await axiosInstance.patch(`/bookings/${args.id}`, args.payload);
	return res.data.data as Booking;
};
