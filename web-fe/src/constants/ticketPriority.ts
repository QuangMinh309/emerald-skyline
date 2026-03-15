import type { StatusType } from "@/components/common/StatusBadge";

export const TicketPriority = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
	URGENT: "URGENT",
} as const;
// cái này là enum trong ts
export type TicketPriority =
	(typeof TicketPriority)[keyof typeof TicketPriority];

// cái này dành cho select option
export const TicketPriorityOptions = [
	{ value: TicketPriority.LOW, label: "Thấp" },
	{ value: TicketPriority.MEDIUM, label: "Trung bình" },
	{ value: TicketPriority.HIGH, label: "Cao" },
	{ value: TicketPriority.URGENT, label: "Khẩn cấp" },
];
// Map cho StatusBadge
export const TicketPriorityMap: Record<
	TicketPriority,
	{ label: string; type: StatusType }
> = {
	LOW: { label: "Thấp", type: "default" },
	MEDIUM: { label: "Trung bình", type: "info" },
	HIGH: { label: "Cao", type: "default" },
	URGENT: { label: "Khẩn cấp", type: "error" },
};
