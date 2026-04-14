import { SummarizeResponse } from "@/types/summarize";
import { AxiosError } from "axios";
import { api } from "./api";

export const SummarizeService = {
  /**
   * Tóm tắt văn bản thành các sự kiện
   * Gọi qua Backend API (emerald-be) - dùng 'api' instance (tương tự OCR)
   * @param text - Văn bản cần tóm tắt
   * @returns Promise chứa danh sách các sự kiện được tóm tắt
   */
  summarizeText: async (text: string): Promise<SummarizeResponse> => {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append("text", text);

        // Sử dụng 'api' instance giống như OCR service
        // api instance đã có baseURL = EXPO_PUBLIC_API_URL (http://10.113.48.185:4000/api/v1)
        // Nên chỉ cần gọi relative path: /ai/summarize
        const url = "/ai/summarize";

        console.log(
          `[Summarize Attempt ${attempt}/${maxRetries}] URL: ${process.env.EXPO_PUBLIC_API_URL}${url}`,
        );

        const response = await api.post<any>(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
          validateStatus: (status) => status >= 200 && status < 300,
        });

        // Backend ResponseDto wraps the actual data in response.data.data
        // So we need to unpack it: { data: SummarizeResponseDto, message, statusCode, ... }
        const summarizeData: SummarizeResponse =
          response.data?.data || response.data;

        console.log("[Summarize Success]", {
          fullResponse: response.data,
          eventsCount: summarizeData?.events?.length || 0,
          originalLength: summarizeData?.original_length,
          status: summarizeData?.status,
        });

        return summarizeData;
      } catch (error) {
        lastError = error;
        const axiosError = error as AxiosError;

        console.error(`[Summarize Error Attempt ${attempt}/${maxRetries}]`, {
          message: axiosError.message,
          code: axiosError.code,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          url: axiosError.config?.url,
        });

        // Nếu đây không phải attempt cuối, hãy retry
        if (attempt < maxRetries) {
          console.log(`[Summarize] Retrying in 1 second...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    // Nếu tất cả attempt thất bại, ném error
    const axiosError = lastError as AxiosError;

    // Xác định loại error
    let errorMessage = "Lỗi không xác định khi tóm tắt";

    if (!axiosError) {
      errorMessage = "Lỗi không xác định";
    } else if (axiosError.code === "ECONNABORTED") {
      errorMessage =
        "Yêu cầu timeout (30s). Backend hoặc AI service có thể quá chậm.";
    } else if (
      axiosError.code === "ERR_NETWORK" ||
      axiosError.message === "Network Error"
    ) {
      errorMessage = `Lỗi kết nối mạng. Kiểm tra:
1. Backend (emerald-be) có chạy không? (${process.env.EXPO_PUBLIC_API_URL}/docs)
2. AI service có chạy không?
3. EXPO_PUBLIC_API_URL có đúng không?
4. Network connectivity có OK không?`;
    } else if (axiosError.response?.status === 400) {
      errorMessage = "Dữ liệu không hợp lệ. Vui lòng nhập ít nhất 10 ký tự.";
    } else if (axiosError.response?.status === 401) {
      errorMessage = "Không có quyền. Vui lòng đăng nhập lại.";
    } else if (axiosError.response?.status === 500) {
      errorMessage = "Lỗi server. Kiểm tra backend logs.";
    } else if (axiosError.response?.status === 503) {
      errorMessage = "AI Service không khả dụng. Kiểm tra AI service logs.";
    } else if (axiosError.message) {
      errorMessage = `Lỗi: ${axiosError.message}`;
    }

    console.error("[Summarize Final Error]", {
      type: axiosError?.code,
      message: errorMessage,
      url: process.env.EXPO_PUBLIC_API_URL,
    });

    throw new Error(errorMessage);
  },
};
