import type { StatusType } from "@/components/common/StatusBadge";

export const TicketStatus = {
	PENDING: "PENDING",
	ASSIGNED: "ASSIGNED",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
} as const;
// cái này là enum trong ts
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

// cái này dành cho select option
export const TicketStatusOptions = [
	{ value: TicketStatus.PENDING, label: "Đang chờ" },
	{ value: TicketStatus.ASSIGNED, label: "Đã giao" },
	{ value: TicketStatus.IN_PROGRESS, label: "Đang tiến hành" },
	{ value: TicketStatus.COMPLETED, label: "Hoàn thành" },
	{ value: TicketStatus.CANCELLED, label: "Đã hủy" },
];

// Map cho StatusBadge
export const TicketStatusMap: Record<
	TicketStatus,
	{ label: string; type: StatusType }
> = {
	PENDING: { label: "Đang chờ", type: "warning" },
	ASSIGNED: { label: "Đã giao", type: "info" },
	IN_PROGRESS: { label: "Đang tiến hành", type: "default" },
	COMPLETED: { label: "Hoàn thành", type: "success" },
	CANCELLED: { label: "Đã hủy", type: "error" },
};
