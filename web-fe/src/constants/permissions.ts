import type { UserRole } from "@/types/auth";

export type PermissionAction =
	| "view"
	| "create"
	| "update"
	| "delete"
	| "manage";

export type PermissionModule =
	| "blocks"
	| "apartments"
	| "invoices"
	| "fees"
	| "residents"
	| "technicians"
	| "assets"
	| "services"
	| "issues"
	| "votings"
	| "maintenances"
	| "notifications"
	| "reports"
	| "accounts"
	| "profile";

export type RolePermissions = Record<PermissionModule, PermissionAction[]>;

// Định nghĩa quyền cho từng role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
	ADMIN: {
		blocks: ["view", "create", "update", "delete", "manage"],
		apartments: ["view", "create", "update", "delete", "manage"],
		invoices: ["view", "manage"],
		fees: ["view", "create", "update", "delete", "manage"],
		residents: ["view", "create", "update", "delete", "manage"],
		technicians: ["view", "create", "update", "delete", "manage"],
		assets: ["view", "create", "update", "delete", "manage"],
		services: ["view", "create", "update", "delete", "manage"],
		issues: ["view", "manage"],
		votings: ["view", "create", "update", "delete", "manage"],
		maintenances: ["view", "manage"],
		notifications: ["view", "create", "update", "delete"],
		reports: ["view"],
		accounts: ["view", "create", "update", "delete", "manage"],
		profile: ["view", "update"],
	},
	TECHNICIAN: {
		blocks: [],
		apartments: [],
		invoices: [],
		fees: [],
		residents: [],
		technicians: [],
		assets: [],
		services: [],
		issues: ["view", "update"], // Phản ánh & Yêu cầu
		votings: [],
		maintenances: ["view", "create", "update"], // Bảo trì
		notifications: [],
		reports: [],
		accounts: [],
		profile: ["view", "update"],
	},
	RESIDENT: {
		blocks: [],
		apartments: [],
		invoices: [],
		fees: [],
		residents: [],
		technicians: [],
		assets: [],
		services: [],
		issues: [],
		votings: [],
		maintenances: [],
		notifications: [],
		reports: [],
		accounts: [],
		profile: [],
	},
};

// Menu items mapping
export const MENU_ITEMS = [
	{ id: "blocks", label: "Quản lý tòa nhà" },
	{ id: "apartments", label: "Căn hộ" },
	{ id: "invoices", label: "Công nợ" },
	{ id: "fees", label: "Phí dịch vụ" },
	{ id: "residents", label: "Cư dân" },
	{ id: "technicians", label: "Kỹ thuật viên" },
	{ id: "assets", label: "Tài sản, thiết bị" },
	{ id: "services", label: "Dịch vụ" },
	{ id: "issues", label: "Phản ánh, yêu cầu" },
	{ id: "votings", label: "Biểu quyết" },
	{ id: "maintenances", label: "Bảo trì" },
	{ id: "notifications", label: "Thông báo" },
	{ id: "reports", label: "Báo cáo thống kê" },
	{ id: "accounts", label: "Tài khoản" },
	{ id: "profile", label: "Tài khoản" },
] as const;
