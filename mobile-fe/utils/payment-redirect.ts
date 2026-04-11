/**
 * Payment redirect handler utilities
 * Handles payment gateway redirects from both deep links and HTTP URLs
 */

import * as Linking from "expo-linking";
import { router } from "expo-router";

export interface PaymentRedirectParams {
  txnRef: string;
  status?: "success" | "failed" | "processing";
  source?: "gateway" | "app";
  amount?: string;
  paymentMethod?: string;
}

/**
 * Parse payment redirect URL and extract parameters
 */
export const parsePaymentRedirectUrl = (
  url: string,
): PaymentRedirectParams | null => {
  try {
    const parsed = Linking.parse(url);
    const queryParams = parsed.queryParams || {};

    const txnRef = queryParams.txnRef as string;
    if (!txnRef) return null;

    return {
      txnRef,
      status: (queryParams.status as any) || "processing",
      source: (queryParams.source as any) || "gateway",
      amount: queryParams.amount as string,
      paymentMethod: queryParams.paymentMethod as string,
    };
  } catch (error) {
    console.error("[PaymentRedirect] Error parsing URL:", error);
    return null;
  }
};

/**
 * Navigate to payment result screen with parameters
 */
export const navigateToPaymentResult = (params: PaymentRedirectParams) => {
  console.log("[PaymentRedirect] Navigating to result screen:", params);

  router.replace({
    pathname: "/payment/result",
    params: {
      txnRef: params.txnRef,
      status: params.status || "success",
      amount: params.amount,
      paymentMethod: params.paymentMethod,
    },
  });
};

/**
 * Handle payment gateway redirect URL
 * Called when app receives deep link from payment gateway
 */
export const handlePaymentRedirect = (url: string) => {
  const params = parsePaymentRedirectUrl(url);
  if (!params) {
    console.warn("[PaymentRedirect] Invalid payment redirect URL:", url);
    return;
  }

  navigateToPaymentResult(params);
};
