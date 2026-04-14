import { scanMeterImage } from "@/services/ai.service";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useScanMeter = () => {
  return useMutation({
    mutationFn: scanMeterImage,
    onError: (error: any) => {
      console.error("OCR Error:", error);

      const status = error?.response?.status;
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message;

      if (status === 503) {
        Alert.alert(
          "AI tạm thời không khả dụng",
          "Dịch vụ OCR đang bận hoặc đang khởi động. Vui lòng nhập chỉ số thủ công.",
        );
        return;
      }

      if (status === 404) {
        Alert.alert(
          "Không tìm thấy endpoint OCR",
          "Dịch vụ OCR chưa sẵn sàng. Vui lòng nhập chỉ số thủ công.",
        );
        return;
      }

      Alert.alert(
        "Lỗi đọc ảnh",
        detail
          ? `Không thể đọc chỉ số từ ảnh (${detail}). Vui lòng nhập tay.`
          : "Không thể đọc chỉ số từ ảnh. Vui lòng nhập tay.",
      );
    },
  });
};
