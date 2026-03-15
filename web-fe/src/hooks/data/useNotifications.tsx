import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notifications.service";
import type { NotificationPayload } from "@/types/notification";

const QUERY_KEY = "notifications";

// get list
export const useNotifications = (params?: any) => {
	return useQuery({
		queryKey: [QUERY_KEY, params],
		queryFn: () => notificationService.getAll(params),
	});
};

// get detail
export const useNotification = (id: number | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEY, id],
		queryFn: () => notificationService.getById(id!),
		enabled: !!id, // Chỉ fetch khi có id
	});
};

// create
export const useCreateNotification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notificationService.create,
		onSuccess: () => {
			// làm mới danh sách sau khi tạo
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};

// update
export const useUpdateNotification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: NotificationPayload }) =>
			notificationService.update(id, data),
		onSuccess: (_, variables) => {
			// làm mới list
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			// làm mới detail của item vừa sửa
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
		},
	});
};

// delete
export const useDeleteNotification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notificationService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};

// delete many
export const useDeleteManyNotifications = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => notificationService.deleteMany(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};
