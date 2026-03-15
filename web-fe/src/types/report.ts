// reports.types.ts
export type RangeType = "month" | "year" | "custom";

export type ReportsParams = {
	startDate?: string; // "YYYY-MM-DD"
	endDate?: string; // "YYYY-MM-DD"
};

export type RevenueBlock = {
	totalRevenue: number;
	percentageComparedToPreviousMonth: number;
};

export type DebtBlock = {
	totalDebt: number;
	totalApartmentsOwing: number;
};

export type MaintenanceBlock = {
	totalAssetsMaintenanced: number;
};

export type RevenueExpenseRawItem = {
	label: string; // "YYYY-MM-DD"
	revenue: number;
	expense: number;
};

export type ServiceBookingRawItem = {
	serviceName: string;
	bookingCount: number;
};

export type AssetStatus = {
	brokenAssets?: number;
	maintenanceAssets?: number;
	maintenancedAssets?: number;
	workingAssets?: number;
};

export type DashboardReport = {
	revenue?: RevenueBlock;
	debt?: DebtBlock;
	maintenance?: MaintenanceBlock;

	revenueExpenseChart?: RevenueExpenseRawItem[];
	serviceBookingChart?: ServiceBookingRawItem[];

	assetStatus?: AssetStatus;
};

export type DashboardReportResponse = {
	statusCode: number;
	message: string;
	data: DashboardReport;
	timestamp: string;
	path: string;
	takenTime: string;
};
