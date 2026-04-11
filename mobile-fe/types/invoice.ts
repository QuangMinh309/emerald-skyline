export interface CalculationBreakdown {
  [key: string]: string; // vd: "Bậc 1": "10*5973"
}

export interface InvoiceDetail {
  id: number;
  feeTypeId: number;
  feeTypeName: string;
  amount: string;
  unitPrice: string | null;
  totalPrice: string;
  vatAmount: string;
  totalWithVat: string;
  calculationBreakdown?: CalculationBreakdown | null;
}

export interface MeterReading {
  id: number;
  feeTypeId: number;
  feeType: {
    id: number;
    name: string;
  };
  readingDate: string;
  billingMonth: string;
  oldIndex: string;
  oldIndexReadingDate: string | null;
  newIndex: string;
  usageAmount: string;
  imageProofUrl: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface InvoiceApartment {
  id: number;
  name: string;
  blockId: number;
  floor: number;
  type: string;
  area: string;
}

export interface InvoiceResponse {
  id: number;
  invoiceCode: string;
  apartmentId: number;
  period: string; // "2024-01-05"
  subtotalAmount: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  status: "UNPAID" | "PAID" | "OVERDUE";
  invoiceDetails?: InvoiceDetail[];
  meterReadings?: MeterReading[];
  apartment?: InvoiceApartment;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeterReadingPayload {
  apartmentId: number;
  waterIndex: number;
  electricityIndex: number;
  waterImage: string;
  electricityImage: string;
}
