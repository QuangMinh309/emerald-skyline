import {
  getInvoiceDetail,
  getResidentInvoices,
  submitMeterReading,
} from "@/services/invoice.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useSubmitMeterReading = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: submitMeterReading,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["monthly-reports"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      Alert.alert(
        "Thành công",
        `Đã tạo hóa đơn thành công!\nTrạng thái: Chưa thanh toán`,
        [
          {
            text: "OK",
            onPress: () => router.back(), // Quay về trang trước
          },
        ],
      );
    },

    onError: (error: any) => {
      console.error("[SubmitMeterReading] error", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      const raw =
        error?.response?.data?.message ??
        error?.response?.data?.detail ??
        error?.message ??
        "Có lỗi xảy ra khi gửi chỉ số. Vui lòng thử lại.";

      const msg = Array.isArray(raw) ? raw.join("\n") : String(raw);
      Alert.alert("Gửi thất bại", msg);
    },
  });
};

export const useResidentInvoices = () => {
  return useQuery({
    queryKey: ["resident-invoices"],
    queryFn: getResidentInvoices,
    staleTime: Infinity,
  });
};

export const useInvoiceDetail = (id: number) => {
  return useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: () => getInvoiceDetail(id),
    enabled: !!id, // Chạy khi có id
    staleTime: Infinity,
  });
};
