export interface MonthlyReportItem {
  month: string; // vd: "2025-01"
  electricityRevenue: number;
  waterRevenue: number;
  managementFeeRevenue: number;
  totalRevenue: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  unpaidAmount: number;
}

export interface MonthlyReportData {
  data: MonthlyReportItem[];
  startMonth: string;
  endMonth: string;
  totalRevenue6Months: number;
  averageMonthlyRevenue: number;
  currentDebt: number;
}
