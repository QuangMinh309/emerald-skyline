/**
 * Payment Gateway Types
 */

export enum PaymentGateway {
  MOMO = "MOMO",
  VNPAY = "VNPAY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentTargetType {
  INVOICE = "INVOICE",
  BOOKING = "BOOKING",
}

export interface InvoiceHistory {
  id: string;
  invoiceCode: string;
  title: string;
  amount: number;
  status: "paid" | "unpaid" | "overdue";
  dueDate: string;
}

export interface MonthlyInvoiceItem {
  id: string;
  name: string;
  amount: number;
  type: string;
  period: string;
}

export interface MonthlyInvoice {
  id: string;
  invoiceCode: string;
  monthTitle: string;
  period: string;
  totalAmount: number;
  status: "paid" | "unpaid" | "overdue";
  items: MonthlyInvoiceItem[];
}

export interface StatisticsItem {
  month: string;
  elec: string;
  water: string;
  service: string;
  total: string;
}

/**
 * Payment Transaction - Lịch sử giao dịch
 */
export interface PaymentTransaction {
  id: number;
  txnRef: string;
  targetType: PaymentTargetType | string;
  targetId: number;
  amount: string; // "4252270.00"
  currency: string;
  paymentMethod: PaymentGateway | string; // "MOMO", "VNPAY"
  status: PaymentStatus | string; // "PENDING", "SUCCESS", "FAILED"
  description: string;
  payDate: string | null;
  paymentUrl: string | null;
  createdAt: string;
  expiresAt?: string;
  retryCount?: number;
}

/**
 * Create Payment Request - with deep link support
 */
export interface CreatePaymentRequest {
  targetType: PaymentTargetType | "INVOICE" | "BOOKING";
  targetId: number;
  paymentMethod: PaymentGateway | "MOMO" | "VNPAY";
  deviceType?: "web" | "mobile" | "ios" | "android";
  redirectUrl?: string;
}

/**
 * Create Payment Response
 */
export interface CreatePaymentResponse {
  id: number;
  txnRef: string;
  paymentUrl: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

/**
 * Payment Status Response
 */
export interface PaymentStatusResponse {
  id: number;
  txnRef: string;
  targetType: string;
  targetId: number;
  amount: string;
  paymentMethod: string;
  status: PaymentStatus | string;
  description: string;
  payDate: string | null;
  paymentUrl: string | null;
  createdAt: string;
  expiresAt?: string;
  retryCount?: number;
  accountId?: number;
}

/**
 * Payment Processing Params
 */
export interface PaymentProcessingParams {
  txnRef: string;
  paymentUrl: string;
  amount?: string | number;
  paymentMethod?: "momo" | "vnpay";
  targetType?: "INVOICE" | "BOOKING";
  targetId?: string | number;
}

/**
 * Payment Result Params
 */
export interface PaymentResultParams {
  status: "success" | "failed" | "expired";
  txnRef: string;
  amount?: string | number;
  paymentMethod?: string;
  errorMessage?: string;
}

/**
 * Payment Flow State
 */
export interface PaymentFlowState {
  isLoading: boolean;
  error: string | null;
  paymentResponse: CreatePaymentResponse | null;
  paymentStatus: PaymentStatusResponse | null;
}
