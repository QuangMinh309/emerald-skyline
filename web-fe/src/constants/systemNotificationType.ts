import type { StatusType } from "@/components/common/StatusBadge";
// định nghĩa các trạng thái của khối nhà
export const SystemNotificationType = {
	INFO: "INFO",
	SUCCESS: "SUCCESS",
	WARNING: "WARNING",
	ERROR: "ERROR",
	SYSTEM: "SYSTEM",
} as const;
// cái này là enum trong ts
export type SystemNotificationType =
	(typeof SystemNotificationType)[keyof typeof SystemNotificationType];
// cái này dành cho hiển thị status với màu sắc
export const SystemNotificationTypeMap: Record<
	SystemNotificationType,
	{ label: string; type: StatusType }
> = {
	INFO: { label: "Thông tin", type: "info" },
	SUCCESS: { label: "Thành công", type: "success" },
	WARNING: { label: "Cảnh báo", type: "warning" },
	ERROR: { label: "Lỗi", type: "error" },
	SYSTEM: { label: "Hệ thống", type: "default" },
};
