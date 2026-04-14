import { OCRResponse } from "@/types/ai";
import { api } from "./api";

const OCR_TIMEOUT_MS = 10000;

const buildImageFormData = (imageUri: string) => {
  const formData = new FormData();

  const filename = imageUri.split("/").pop() || "meter.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  return formData;
};

const extractReading = (responseData: any): string => {
  const ocrData: OCRResponse = responseData?.data || responseData;
  const reading = ocrData?.meter_reading;
  if (reading === null || reading === undefined) return "";
  return String(reading).trim();
};

export const scanMeterImage = async (imageUri: string): Promise<string> => {
  const response = await api.post<any>(
    "/ai/ocr/read-meter",
    buildImageFormData(imageUri),
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: OCR_TIMEOUT_MS,
    },
  );

  return extractReading(response.data);
};
