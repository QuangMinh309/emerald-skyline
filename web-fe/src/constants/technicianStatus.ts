import type { StatusType } from "@/components/common/StatusBadge";
// định nghĩa các trạng thái của khối nhà
export const TechnicianStatus = {
	AVAILABLE: "AVAILABLE",
	BUSY: "BUSY",
	OFF_DUTY: "OFF_DUTY",
	RESIGNED: "RESIGNED",
} as const;
// cái này là enum trong ts
export type TechnicianStatus =
	(typeof TechnicianStatus)[keyof typeof TechnicianStatus];
// cái này dành cho select option
export const TechnicianStatusOption = [
	{ label: "Hoạt động", value: TechnicianStatus.AVAILABLE },
	{ label: "Đang bận", value: TechnicianStatus.BUSY },
	{ label: "Đang nghỉ", value: TechnicianStatus.OFF_DUTY },
	{ label: "Đã nghỉ việc", value: TechnicianStatus.RESIGNED },
] as const;
// cái này dành cho hiển thị status với màu sắc
export const TechnicianStatusMap: Record<
	TechnicianStatus,
	{ label: string; type: StatusType }
> = {
	AVAILABLE: { label: "Hoạt động", type: "success" },
	BUSY: { label: "Đang bận", type: "warning" },
	OFF_DUTY: { label: "Đang nghỉ", type: "error" },
	RESIGNED: { label: "Đã nghỉ việc", type: "default" },
};
