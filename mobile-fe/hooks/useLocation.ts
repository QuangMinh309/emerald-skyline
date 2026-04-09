import { getProvinceDetails, getProvinces } from "@/services/location.service";
import { useQuery } from "@tanstack/react-query";

// lấy danh sách tỉnh
export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
    staleTime: Infinity,
  });
};

export const useWardsByProvince = (provinceCode: number | null) => {
  return useQuery({
    queryKey: ["province-details", provinceCode],
    queryFn: () => getProvinceDetails(provinceCode!),
    enabled: !!provinceCode, // chỉ chạy khi đã chọn tỉnh
    select: (data) => data.wards || [], // chỉ lấy mảng wards để dùng
  });
};
