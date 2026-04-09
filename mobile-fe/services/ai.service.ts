import { OCRResponse } from "@/types/ai";
import { Platform } from "react-native";
import { api } from "./api";

export const scanMeterImage = async (imageUri: string): Promise<string> => {
  const formData = new FormData();

  const filename = imageUri.split("/").pop() || "meter.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append("file", {
    uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
    name: filename,
    type: type,
  } as any);

  // API endpoint: /ai/ocr/read-meter (relative path)
  // api instance baseURL = http://10.113.48.185:4000/api/v1
  // Final URL: http://10.113.48.185:4000/api/v1/ai/ocr/read-meter
  const response = await api.post<any>("/ai/ocr/read-meter", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Backend response is wrapped by TransformInterceptor
  // { data: OCRResponse, message, statusCode, ... }
  // We need to unpack response.data.data
  const ocrData: OCRResponse = response.data?.data || response.data;

  return ocrData.meter_reading;
};
