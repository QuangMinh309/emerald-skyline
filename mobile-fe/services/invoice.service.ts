import { InvoiceResponse, MeterReadingPayload } from "@/types/invoice";
import { api } from "./api";

export const submitMeterReading = async (
  payload: MeterReadingPayload,
): Promise<InvoiceResponse> => {
  const buildFormData = (includeImages: boolean) => {
    const formData = new FormData();

    formData.append("apartmentId", String(payload.apartmentId));
    formData.append("waterIndex", String(payload.waterIndex));
    formData.append("electricityIndex", String(payload.electricityIndex));

    if (includeImages && payload.waterImage) {
      appendImage(formData, "waterImage", payload.waterImage);
    }
    if (includeImages && payload.electricityImage) {
      appendImage(formData, "electricityImage", payload.electricityImage);
    }

    return formData;
  };

  // tạo object ảnh chuẩn cho React Native
  const appendImage = (formData: FormData, fieldName: string, uri: string) => {
    // lấy tên file từ đường dẫn hoặc random
    const filename = uri.split("/").pop() || `upload_${Date.now()}.jpg`;

    // đoán đuôi file để set mime type chính xác
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // React Native yêu cầu object có dạng { uri, name, type }
    formData.append(fieldName, {
      uri,
      name: filename,
      type: type,
    } as any);
  };

  const response = await api.post("/invoices/client", buildFormData(true), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    transformRequest: (data) => data,
    timeout: 60000,
  });
  return response.data;
};

export const getResidentInvoices = async (): Promise<InvoiceResponse[]> => {
  const tryGet = async (url: string) => {
    const response = await api.get<any>(url);
    const payload = response?.data?.data;
    if (Array.isArray(payload)) return payload as InvoiceResponse[];
    if (Array.isArray(payload?.invoices)) return payload.invoices as InvoiceResponse[];
    return [];
  };

  try {
    return await tryGet("/residents/me/invoices");
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;
  }

  try {
    return await tryGet("/invoices/client-created/list");
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;
  }

  return [];
};

export const getInvoiceDetail = async (id: number): Promise<InvoiceResponse> => {
  const response = await api.get<{ data: InvoiceResponse }>(`/invoices/${id}`);
  return response.data.data;
};
