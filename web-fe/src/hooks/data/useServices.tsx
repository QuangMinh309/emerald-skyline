// src/hooks/useServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createService,
	deleteService,
	getServiceById,
	getServices,
	updateService,
	deleteManyServices,
} from "@/services/services.service";
import type { Service } from "@/types/service";

export const useServices = () => {
	return useQuery({
		queryKey: ["services"],
		queryFn: getServices,
	});
};

/**
 * Lấy detail theo id.
 * - enabled param giúp bạn chủ động bật/tắt fetch (ví dụ: id chưa hợp lệ)
 */
export const useServiceDetail = (id?: number, enabled = true) => {
	const isValidId = Number.isFinite(id) && (id as number) > 0;

	return useQuery({
		queryKey: ["services", id ?? "invalid"],
		queryFn: () => getServiceById(id as number),
		enabled: enabled && isValidId,
	});
};

// (Optional) Alias nếu bạn thích tên này
export const useGetServiceById = useServiceDetail;

export const useCreateService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createService,
		onSuccess: (newItem) => {
			queryClient.setQueryData(["services"], (old: Service[] = []) => [
				newItem,
				...old,
			]);
		},
	});
};

export const useUpdateService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateService,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["services"] });
			queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
		},
	});
};

export const useDeleteService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteService,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["services"] });
		},
	});
};

export const useDeleteManyServices = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyServices(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["services"] });
		},
	});
};
