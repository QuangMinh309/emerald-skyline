import { InvoiceHistory, MonthlyInvoice } from "../types/payment";

export const MOCK_HISTORY: InvoiceHistory[] = [
  {
    id: "1",
    invoiceCode: "INV-202511-A1205",
    title: "Tháng 11/2025",
    amount: 1250000,
    status: "unpaid",
    dueDate: "25/11/2025",
  },
  {
    id: "2",
    invoiceCode: "INV-202510-A1205",
    title: "Tháng 10/2025",
    amount: 1150000,
    status: "overdue",
    dueDate: "25/10/2025",
  },
  {
    id: "3",
    invoiceCode: "INV-202509-A1205",
    title: "Tháng 09/2025",
    amount: 1250000,
    status: "paid",
    dueDate: "25/09/2025",
  },
];

export const MOCK_DETAIL_INVOICES: MonthlyInvoice[] = [
  {
    id: "M01",
    invoiceCode: "INV-202601-A1205",
    monthTitle: "Tháng 01/2026",
    period: "10/2025 - 11/2025",
    totalAmount: 1250000,
    status: "unpaid",
    items: [
      {
        id: "S1",
        name: "Phí quản lý",
        amount: 500000,
        type: "management",
        period: "11/2025",
      },
      {
        id: "S2",
        name: "Điện",
        amount: 450000,
        type: "electricity",
        period: "10/2025 - 11/2025",
      },
      {
        id: "S3",
        name: "Nước",
        amount: 150000,
        type: "water",
        period: "10/2025 - 11/2025",
      },
    ],
  },
  {
    id: "M12",
    invoiceCode: "INV-202612-A1205",
    monthTitle: "Tháng 12/2026",
    period: "10/2025 - 11/2025",
    totalAmount: 1250000,
    status: "unpaid",
    items: [
      {
        id: "S4",
        name: "Phí quản lý",
        amount: 500000,
        type: "management",
        period: "11/2025",
      },
      {
        id: "S5",
        name: "Điện",
        amount: 450000,
        type: "electricity",
        period: "10/2025 - 11/2025",
      },
      {
        id: "S6",
        name: "Nước",
        amount: 150000,
        type: "water",
        period: "10/2025 - 11/2025",
      },
    ],
  },
];
