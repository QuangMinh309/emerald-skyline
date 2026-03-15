// định nghĩa các trạng thái của khối nhà
export const SystemNotificationPriority = {
	LOW: "LOW",
	NORMAL: "NORMAL",
	HIGH: "HIGH",
	URGENT: "URGENT",
} as const;
// cái này là enum trong ts
export type SystemNotificationPriorityType =
	(typeof SystemNotificationPriority)[keyof typeof SystemNotificationPriority];
// cái này dành cho hiển thị status với màu sắc
