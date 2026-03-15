import axiosInstance from "@/lib/axios";
import type { DashboardReport, ReportsParams } from "@/types/report";

export const getReports = async (
	params: ReportsParams,
): Promise<DashboardReport> => {
	const res = await axiosInstance.get("/reports/dashboard", { params });
	return res.data.data as DashboardReport;
};
