import { scanMeterImage } from "@/services/ai.service";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useScanMeter = () => {
  return useMutation({
    mutationFn: scanMeterImage,
    onError: (error: any) => {
      console.error("OCR Error:", error);
      Alert.alert("Lỗi đọc ảnh", "Không thể đọc chỉ số từ ảnh. Vui lòng nhập tay.");
    },
  });
};
