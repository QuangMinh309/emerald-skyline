import { getFeeById, getFees } from "@/services/fee.service";
import { useQuery } from "@tanstack/react-query";

export const useFees = () => {
	return useQuery({
		queryKey: ["fees"],
		queryFn: getFees,
	});
};

export const useGetFeeById = (id: number) => {
	return useQuery({
		queryKey: ["fee", id],
		queryFn: () => getFeeById(id),
		enabled: !!id,
	});
};
