import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	systemNotificationService,
	type QueryUserNotificationParams,
} from "@/services/system-notifications.service";
import { useAppDispatch } from "@/store/hooks";
import {
	markAllRead,
	markOneRead,
	initializeNotifications,
} from "@/store/slices/notificationSlice";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const QUERY_KEY = "system-notifications";

/**
 * Hook để lấy danh sách thông báo của user với Redux integration
 */
export const useSystemNotifications = (
	params?: QueryUserNotificationParams,
) => {
	const dispatch = useAppDispatch();

	return useQuery({
		queryKey: [QUERY_KEY, "my-notifications", params],
		queryFn: async () => {
			const response =
				await systemNotificationService.getMyNotifications(params);
			// Initialize Redux with notifications data
			if (response.data) {
				dispatch(initializeNotifications(response.data));
			}
			return response;
		},
	});
};

/**
 * Hook để lấy danh sách thông báo (legacy - for backward compatibility)
 */
export const useMySystemNotifications = () => {
	const { isAuthenticated } = useAuth();
	const dispatch = useAppDispatch();

	return useQuery({
		queryKey: ["systemNotifications"],
		queryFn: async () => {
			const response = await systemNotificationService.getMyNotifications();
			// Initialize Redux with notifications data
			if (response.data) {
				dispatch(initializeNotifications(response.data));
			}
			return response.data;
		},
		enabled: isAuthenticated,
	});
};

/**
 * Hook để lấy số lượng thông báo chưa đọc
 */
export const useUnreadCount = () => {
	return useQuery({
		queryKey: [QUERY_KEY, "unread-count"],
		queryFn: () => systemNotificationService.getUnreadCount(),
		refetchInterval: 30000, // Refresh every 30 seconds
	});
};

/**
 * Hook để lấy thống kê thông báo
 */
export const useNotificationStats = () => {
	return useQuery({
		queryKey: [QUERY_KEY, "stats"],
		queryFn: () => systemNotificationService.getMyStats(),
	});
};

/**
 * Hook để đánh dấu một thông báo là đã đọc với Redux integration
 */
export const useMarkAsRead = () => {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: number) =>
			systemNotificationService.markAsRead(notificationId),
		onSuccess: (_data, notificationId) => {
			// Update Redux state
			dispatch(markOneRead(notificationId));
			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
		onError: () => {
			toast.error("Không thể đánh dấu đã đọc");
		},
	});
};

/**
 * Hook để đánh dấu tất cả thông báo là đã đọc với Redux integration
 */
export const useMarkAllAsRead = () => {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => systemNotificationService.markAllAsRead(),
		onSuccess: () => {
			// Update Redux state
			dispatch(markAllRead());
			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			toast.success("Đã đánh dấu tất cả là đã đọc");
		},
		onError: () => {
			toast.error("Không thể đánh dấu tất cả đã đọc");
		},
	});
};

/**
 * Alias for backward compatibility
 */
export const useMarkAllNotificationsAsRead = useMarkAllAsRead;
