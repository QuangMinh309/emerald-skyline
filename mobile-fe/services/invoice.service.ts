import { InvoiceResponse, MeterReadingPayload } from "@/types/invoice";
import { Platform } from "react-native";
import { api } from "./api";

export const submitMeterReading = async (
  payload: MeterReadingPayload,
): Promise<InvoiceResponse> => {
  const formData = new FormData();

  formData.append("apartmentId", String(payload.apartmentId));
  formData.append("waterIndex", String(payload.waterIndex));
  formData.append("electricityIndex", String(payload.electricityIndex));

  // tạo object ảnh chuẩn cho React Native
  const appendImage = (fieldName: string, uri: string) => {
    // lấy tên file từ đường dẫn hoặc random
    const filename = uri.split("/").pop() || `upload_${Date.now()}.jpg`;

    // đoán đuôi file để set mime type chính xác
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // React Native yêu cầu object có dạng { uri, name, type }
    formData.append(fieldName, {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      name: filename,
      type: type,
    } as any);
  };

  // append ảnh (chắc chắn uri không null vì đã validate ở UI)
  appendImage("waterImage", payload.waterImage);
  appendImage("electricityImage", payload.electricityImage);

  try {
    const response = await api.post("/invoices/client", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
      timeout: 60000,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getResidentInvoices = async (): Promise<InvoiceResponse[]> => {
  const response = await api.get<{ data: { invoices: InvoiceResponse[] } }>(
    "/residents/me/invoices",
  );
  return response.data.data.invoices;
};

export const getInvoiceDetail = async (id: number): Promise<InvoiceResponse> => {
  const response = await api.get<{ data: InvoiceResponse }>(`/invoices/${id}`);
  return response.data.data;
};
