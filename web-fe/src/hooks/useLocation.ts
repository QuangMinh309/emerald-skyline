import { useQuery } from "@tanstack/react-query";
import { getProvinces, getProvinceDetails } from "@/services/location.service";
import type { Province } from "@/types/location";

export const useProvinces = () => {
	return useQuery<Province[]>({
		queryKey: ["provinces"],
		queryFn: getProvinces,
		staleTime: 1000 * 60 * 60, // Cache for 1 hour
	});
};

export const useProvinceDetails = (provinceCode: number | null) => {
	return useQuery<Province>({
		queryKey: ["province", provinceCode],
		queryFn: () => getProvinceDetails(provinceCode!),
		enabled: !!provinceCode,
		staleTime: 1000 * 60 * 60, // Cache for 1 hour
	});
};
