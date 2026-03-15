import type { StatusType } from "@/components/common/StatusBadge";
// định nghĩa các trạng thái của khối nhà
export const BlockStatus = {
	OPERATING: "OPERATING",
	UNDER_CONSTRUCTION: "UNDER_CONSTRUCTION",
	UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
} as const;
// cái này là enum trong ts
export type BlockStatusType = (typeof BlockStatus)[keyof typeof BlockStatus];
// cái này dành cho select option
export const BlockStatusOption = [
	{ label: "Hoạt động", value: BlockStatus.OPERATING },
	{ label: "Đang xây dựng", value: BlockStatus.UNDER_CONSTRUCTION },
	{ label: "Đang bảo trì", value: BlockStatus.UNDER_MAINTENANCE },
] as const;
// cái này dành cho hiển thị status với màu sắc
export const BlockStatusMap: Record<
	BlockStatusType,
	{ label: string; type: StatusType }
> = {
	OPERATING: { label: "Hoạt động", type: "success" },
	UNDER_CONSTRUCTION: { label: "Đang xây dựng", type: "warning" },
	UNDER_MAINTENANCE: { label: "Đang bảo trì", type: "error" },
};
