import { ResidentResponse, UpdateResidentPayload } from "@/types/resident";
import { api } from "./api";

const BASE = "residents";

const buildDemoResidentProfile = (authProfile: any): ResidentResponse => ({
  id: authProfile?.id || 0,
  accountId: authProfile?.id || 0,
  isFallbackProfile: true,
  fullName: authProfile?.email?.split("@")[0] || "Resident Demo",
  citizenId: "",
  imageUrl: null,
  dob: new Date("1995-01-01").toISOString(),
  gender: "OTHER",
  phoneNumber: "",
  email: authProfile?.email || "resident@gmail.com",
  nationality: "Việt Nam",
  province: "",
  district: "",
  ward: "",
  detailAddress: "",
  isActive: true,
  apartments: [],
});

export const getResidentProfile = async (): Promise<ResidentResponse> => {
  try {
    const response = await api.get(`${BASE}/me`);
    return response.data.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const authResponse = await api.get("/auth/profile");
      return buildDemoResidentProfile(authResponse?.data?.data || authResponse?.data);
    }
    throw err;
  }
};

export const updateResidentProfile = async (
  id: number,
  payload: UpdateResidentPayload,
): Promise<ResidentResponse> => {
  try {
    const formData = new FormData();

    if (payload.fullName) formData.append("fullName", payload.fullName);
    if (payload.citizenId) formData.append("citizenId", payload.citizenId);
    if (payload.dob) formData.append("dob", payload.dob);
    if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
    if (payload.gender) formData.append("gender", payload.gender);

    // địa chỉ
    if (payload.province) formData.append("province", payload.province);
    if (payload.ward) formData.append("ward", payload.ward);
    if (payload.detailAddress) formData.append("detailAddress", payload.detailAddress);
    formData.append("district", ""); // gửi rỗng

    // avt
    if (payload.image) {
      formData.append("image", {
        uri: payload.image.uri,
        name: payload.image.fileName || `avatar_${Date.now()}.jpg`,
        type: payload.image.mimeType || "image/jpeg",
      } as any);
    }

    const response = await api.patch(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (err) {
    throw err;
  }
};
