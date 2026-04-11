import { PaymentTransaction } from "@/types/payment";
import { api } from "./api";

export interface CreatePaymentRequest {
  targetType: "INVOICE" | "BOOKING";
  targetId: number;
  paymentMethod: "MOMO" | "VNPAY";
  deviceType?: "web" | "mobile" | "ios" | "android";
  redirectUrl?: string;
}

export interface CreateBatchPaymentRequest {
  targetType: "INVOICE" | "BOOKING";
  targetIds: number[];
  paymentMethod: "MOMO" | "VNPAY";
  deviceType?: "web" | "mobile" | "ios" | "android";
  redirectUrl?: string;
}

export interface CreatePaymentResponse {
  id: number;
  txnRef: string;
  paymentUrl: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  batchIds?: number[];
  itemCount?: number;
}

export interface PaymentStatusResponse {
  id: number;
  txnRef: string;
  targetType: string;
  targetId: number;
  amount: string;
  paymentMethod: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  description: string;
  payDate: string | null;
  paymentUrl: string | null;
  createdAt: string;
  expiresAt?: string;
  retryCount?: number;
}

/**
 * Tạo giao dịch thanh toán
 * @param data - Payment data with deviceType for deep linking (mobile-specific)
 * @throws Error if API request fails
 */
export const createPayment = async (
  data: CreatePaymentRequest,
): Promise<CreatePaymentResponse> => {
  try {
    const response = await api.post<{ data: CreatePaymentResponse }>(
      "/payments",
      data,
    );
    return response.data.data;
  } catch (error) {
    console.error("[Payment] Failed to create payment:", error);
    throw error;
  }
};

/**
 * Tạo giao dịch thanh toán batch (nhiều hóa đơn/booking)
 * @param data - Batch payment data with multiple targetIds
 * @throws Error if API request fails
 */
export const createBatchPayment = async (
  data: CreateBatchPaymentRequest,
): Promise<CreatePaymentResponse> => {
  try {
    const response = await api.post<{ data: CreatePaymentResponse }>(
      "/payments/batch",
      data,
    );
    return response.data.data;
  } catch (error) {
    console.error("[Payment] Failed to create batch payment:", error);
    throw error;
  }
};

/**
 * Lấy trạng thái giao dịch thanh toán theo ID
 */
export const getPaymentStatus = async (
  paymentId: number,
): Promise<PaymentStatusResponse> => {
  const response = await api.get<{ data: PaymentStatusResponse }>(
    `/payments/${paymentId}`,
  );
  return response.data.data;
};

/**
 * Lấy trạng thái giao dịch theo mã tham chiếu (txnRef)
 */
export const getPaymentByTxnRef = async (
  txnRef: string,
): Promise<PaymentStatusResponse> => {
  const response = await api.get<{ data: PaymentStatusResponse }>(
    `/payments/txn-ref/${txnRef}`,
  );
  return response.data.data;
};

/**
 * Lấy danh sách giao dịch của hóa đơn
 */
export const getPaymentHistoryByInvoice = async (
  invoiceId: number,
): Promise<PaymentTransaction[]> => {
  const response = await api.get<{ data: PaymentTransaction[] }>(
    `/payments/invoice/${invoiceId}`,
  );
  return response.data.data;
};

/**
 * Lấy danh sách giao dịch của booking
 */
export const getPaymentHistoryByBooking = async (
  bookingId: number,
): Promise<PaymentTransaction[]> => {
  const response = await api.get<{ data: PaymentTransaction[] }>(
    `/payments/booking/${bookingId}`,
  );
  return response.data.data;
};

/**
 * Poll để kiểm tra trạng thái thanh toán
 */
export const pollPaymentStatus = async (
  txnRef: string,
  maxRetries = 30,
  intervalMs = 1000,
): Promise<PaymentStatusResponse> => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const payment = await getPaymentByTxnRef(txnRef);

      // Nếu đã có kết quả (SUCCESS/FAILED), return ngay
      if (payment.status === "SUCCESS" || payment.status === "FAILED") {
        return payment;
      }

      attempts++;
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      attempts++;
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }

  // Nếu vẫn PENDING sau khi timeout, return trạng thái cuối cùng
  return getPaymentByTxnRef(txnRef);
};
