import { MonthlyReportData } from "@/types/report";
import { api } from "./api";

const BASE = "reports";

export const getMonthlyReports = async (): Promise<MonthlyReportData> => {
  try {
    const response = await api.get(`${BASE}/monthly-reports`);
    return response.data.data;
  } catch (err) {
    throw err;
  }
};
