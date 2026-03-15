import type { StatusType } from "@/components/common/StatusBadge";
// định nghĩa các trạng thái của khối nhà
export const InvoiceStatus = {
	PAID: "PAID",
	UNPAID: "UNPAID",
	OVERDUE: "OVERDUE",
} as const;
// cái này là enum trong ts
export type InvoiceStatusType =
	(typeof InvoiceStatus)[keyof typeof InvoiceStatus];
// cái này dành cho select option
export const InvoiceStatusOption = [
	{ label: "Đã thanh toán", value: InvoiceStatus.PAID },
	{ label: "Chưa thanh toán", value: InvoiceStatus.UNPAID },
	{ label: "Quá hạn", value: InvoiceStatus.OVERDUE },
] as const;
// cái này dành cho hiển thị status với màu sắc
export const InvoiceStatusMap: Record<
	InvoiceStatusType,
	{ label: string; type: StatusType }
> = {
	PAID: { label: "Đã thanh toán", type: "success" },
	UNPAID: { label: "Chưa thanh toán", type: "warning" },
	OVERDUE: { label: "Quá hạn", type: "error" },
};
