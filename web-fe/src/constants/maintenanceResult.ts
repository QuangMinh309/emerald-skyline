export const MaintenanceResult = {
	GOOD: "GOOD",
	NEEDS_REPAIR: "NEEDS_REPAIR",
	MONITORING: "MONITORING",
} as const;
// cái này là enum trong ts
export type MaintenanceResult =
	(typeof MaintenanceResult)[keyof typeof MaintenanceResult];

// cái này dành cho select option
export const MaintenanceResultOptions = [
	{ value: MaintenanceResult.GOOD, label: "Tốt" },
	{ value: MaintenanceResult.NEEDS_REPAIR, label: "Cần sửa chữa" },
	{ value: MaintenanceResult.MONITORING, label: "Đang theo dõi" },
];
