import { getFeeDetail } from "@/services/fee.service";
import { useQuery } from "@tanstack/react-query";

export const useFeeDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["fee-detail", id],
    queryFn: () => getFeeDetail(id as number),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
