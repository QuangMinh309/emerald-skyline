import { Province } from "@/types/location";
import axios from "axios";

const LOCATION_API = "https://provinces.open-api.vn/api/v2";

// lấy danh sách các tỉnh
export const getProvinces = async (): Promise<Province[]> => {
  // gọi /p/ mặc định depth=1 chỉ lấy danh sách tỉnh
  const res = await axios.get(`${LOCATION_API}/p/`);
  return res.data;
};

// lấy chi tiết 1 tỉnh (kèm theo wards)
export const getProvinceDetails = async (provinceCode: number): Promise<Province> => {
  // gọi /p/{code}?depth=2 để lấy luôn mảng wards bên trong
  const res = await axios.get(`${LOCATION_API}/p/${provinceCode}?depth=2`);
  return res.data;
};
