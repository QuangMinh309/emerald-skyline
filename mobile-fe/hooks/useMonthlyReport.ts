import { getMonthlyReports } from "@/services/report.service";
import { useQuery } from "@tanstack/react-query";

export const useMonthlyReports = () => {
  return useQuery({
    queryKey: ["monthly-reports"],
    queryFn: getMonthlyReports,
    // cần invalidateQueries (khi nhập chỉ số điện/nước xong) để cập nhật lập tức.
    staleTime: 12 * 60 * 60 * 1000,
  });
};
