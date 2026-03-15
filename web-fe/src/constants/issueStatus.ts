import type { IssueType, IssueStatus } from "@/types/issue";
import type { StatusType } from "@/components/common/StatusBadge";

// loại sự cố
export const IssueTypeOptions: { value: IssueType; label: string }[] = [
	{ value: "TECHNICAL", label: "Kỹ thuật" },
	{ value: "CLEANING", label: "Vệ sinh" },
	{ value: "NOISE", label: "Tiếng ồn" },
	{ value: "SECURITY", label: "An ninh" },
	{ value: "FIRE", label: "Phòng cháy chữa cháy" },
	{ value: "OTHERS", label: "Khác" },
];

export const IssueTypeMap: Record<
	IssueType,
	{ label: string; type: StatusType }
> = {
	TECHNICAL: { label: "Kỹ thuật", type: "default" },
	CLEANING: { label: "Vệ sinh", type: "default" },
	NOISE: { label: "Tiếng ồn", type: "warning" },
	SECURITY: { label: "An ninh", type: "error" },
	FIRE: { label: "PCCC", type: "error" },
	OTHERS: { label: "Khác", type: "default" },
};

// trạng thái
export const IssueStatusOptions: { value: IssueStatus; label: string }[] = [
	{ value: "PENDING", label: "Chờ tiếp nhận" },
	{ value: "RECEIVED", label: "Đã tiếp nhận" },
	{ value: "PROCESSING", label: "Đang xử lý" },
	{ value: "RESOLVED", label: "Đã giải quyết" },
	{ value: "REJECTED", label: "Đã từ chối" },
];

export const IssueStatusMap: Record<
	IssueStatus,
	{ label: string; type: StatusType }
> = {
	PENDING: { label: "Chờ tiếp nhận", type: "warning" },
	RECEIVED: { label: "Đã tiếp nhận", type: "purple" },
	PROCESSING: { label: "Đang xử lý", type: "info" },
	RESOLVED: { label: "Đã giải quyết", type: "success" },
	REJECTED: { label: "Đã từ chối", type: "error" },
};
