import {
  Booking,
  BookingStatus,
  Service,
  SlotAvailability,
} from "@/types/service";
import { api } from "./api";

const URI = "/services";
const BOOKING_URI = "/bookings";

export const ServiceService = {
  get: async (): Promise<{ data: Service[] }> => {
    const response = await api.get(URI);
    return {
      data: response.data.data.map(mapServiceData),
    };
  },

  getById: async (id: number): Promise<{ data: Service }> => {
    const response = await api.get(`${URI}/${id}`);
    return {
      data: mapServiceData(response.data.data),
    };
  },

  getSlots: async (
    id: number,
    date: string,
  ): Promise<{ data: SlotAvailability[] }> => {
    const response = await api.get(`${URI}/${id}/resident`, {
      params: { date },
    });
    return {
      data: response.data.data.slots.map((slot: any) => mapSlot(id, slot)),
    };
  },

  reserve: async (
    id: number,
    body: {
      bookingDate: string;
      slots: { startTime: string; endTime: string }[];
    },
  ): Promise<{ data: Booking }> => {
    const response = await api.post(`${URI}/slot/${id}/reserve`, body);
    return {
      data: response.data.data,
    };
  },

  getMyBookings: async (): Promise<{ data: Booking[] }> => {
    const response = await api.get(`${BOOKING_URI}/mine`);
    return {
      data: response.data.data.map(mapBookingData),
    };
  },

  getBookingById: async (id: number): Promise<{ data: any }> => {
    const response = await api.get(`${BOOKING_URI}/${id}`);
    return {
      data: response.data.data,
    };
  },

  confirmPayment: async (
    id: number,
    body: { method: string; note: string },
  ): Promise<any> => {
    const response = await api.post(`${BOOKING_URI}/${id}/paid`, body);
    return response.data;
  },

  createPaymentForBooking: async (
    id: number,
    paymentMethod: string,
  ): Promise<any> => {
    const response = await api.post(`${BOOKING_URI}/${id}/payment`, {
      targetType: "BOOKING",
      targetId: id,
      paymentMethod,
      deviceType: "mobile",
    });
    return response.data.data || response.data;
  },
};

const mapServiceData = (raw: any): Service => {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    open_hour: raw.openHour?.slice(0, 5), // "08:00:00" -> "08:00"
    close_hour: raw.closeHour?.slice(0, 5), // "20:00:00" -> "20:00"
    url: raw.imageUrl ?? "",
    unit_price: raw.unitPrice,
    unit: raw.unitTimeBlock,
    total_slot: raw.totalSlot,
    created_at: raw.createdAt,
    type: raw.type,
    category: raw.typeLabel ?? undefined,
  };
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const mapSlot = (service_id: number, raw: any): SlotAvailability => {
  return {
    id: `${service_id}-${raw.startTime}`,
    service_id,
    start_time: formatTime(raw.startTime),
    end_time: formatTime(raw.endTime),
    remaining_slot: raw.remainingSlot,
  };
};

const mapBookingData = (raw: any): Booking => {
  return {
    id: raw.id,
    code: raw.code,
    customer_id: raw.resident.id,
    customer_name: raw.resident.fullName,
    customer_phone: raw.resident.phoneNumber,
    service_id: raw.service.id,
    service_name: raw.service.name,
    date: raw.bookingDate,
    timestamps: raw.timestamps.map((t: any) => ({
      startTime: t.startTime,
      endTime: t.endTime,
    })),
    unit_price: raw.unitPrice,
    total: raw.totalPrice,
    created_at: raw.createdAt,
    status: raw.status as BookingStatus,
    expiresAt: raw.expiresAt,
  };
};
