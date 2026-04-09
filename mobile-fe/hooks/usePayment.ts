import {
  createPayment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  getPaymentHistoryByInvoice,
  PaymentStatusResponse,
  pollPaymentStatus,
} from "@/services/payment.service";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export const usePaymentHistory = (invoiceId: number) => {
  return useQuery({
    queryKey: ["payment-history", invoiceId],
    queryFn: () => getPaymentHistoryByInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};

interface PaymentFlowState {
  isLoading: boolean;
  error: string | null;
  paymentResponse: CreatePaymentResponse | null;
  paymentStatus: PaymentStatusResponse | null;
}

/**
 * Hook để quản lý toàn bộ flow thanh toán
 * Bao gồm: Tạo payment, redirect, polling, tracking
 */
export const usePaymentFlow = () => {
  const [state, setState] = useState<PaymentFlowState>({
    isLoading: false,
    error: null,
    paymentResponse: null,
    paymentStatus: null,
  });

  /**
   * Tạo giao dịch thanh toán
   */
  const initiatePayment = useCallback(async (paymentData: CreatePaymentRequest) => {
    setState({
      isLoading: true,
      error: null,
      paymentResponse: null,
      paymentStatus: null,
    });

    try {
      const response = await createPayment(paymentData);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        paymentResponse: response,
      }));

      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo giao dịch thanh toán";

      setState({
        isLoading: false,
        error: errorMessage,
        paymentResponse: null,
        paymentStatus: null,
      });

      throw err;
    }
  }, []);

  /**
   * Polling để kiểm tra trạng thái thanh toán
   */
  const checkPaymentStatus = useCallback(async (txnRef: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const status = await pollPaymentStatus(txnRef, 60, 2000);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        paymentStatus: status,
      }));

      return status;
    } catch (err: any) {
      const errorMessage = err?.message || "Không thể kiểm tra trạng thái";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw err;
    }
  }, []);

  /**
   * Reset state
   */
  const resetPayment = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      paymentResponse: null,
      paymentStatus: null,
    });
  }, []);

  return {
    ...state,
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
  };
};
