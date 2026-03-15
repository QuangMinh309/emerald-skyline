import type { StatusType } from "@/components/common/StatusBadge";
export type ApartmentStatusType = "Trống" | "Đang ở";
export const ApartmentStatusMap: Record<
	ApartmentStatusType,
	{ label: string; type: StatusType }
> = {
	Trống: { label: "Trống", type: "default" },
	"Đang ở": { label: "Đang ở", type: "success" },
};
