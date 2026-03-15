import axiosInstance from "@/lib/axios";
import type {
	GetUserNotificationsResponse,
	UnreadCountResponse,
	UserNotificationStatsResponse,
	MarkAsReadResponse,
	SystemNotification,
	SystemUserNotification,
} from "@/types/system-notification";
import type { SystemNotificationPriorityType } from "@/constants/systemNotificationPriority";
import type { SystemNotificationType } from "@/constants/systemNotificationType";

const BASE = "/system-notifications";

export interface QueryUserNotificationParams {
	page?: number;
	limit?: number;
	isRead?: boolean;
	type?: string;
}

export interface SendSystemNotificationDto {
	title: string;
	content: string;
	type?: SystemNotificationType;
	priority?: SystemNotificationPriorityType;
	targetUserIds?: number[];
	metadata?: Record<string, any>;
	actionUrl?: string;
	actionText?: string;
	isPersistent?: boolean;
	scheduledFor?: string;
	expiresAt?: string;
}

// Main service object
export const systemNotificationService = {
	/* =====================================================
     USER APIs
  ===================================================== */

	/**
	 * Lấy danh sách thông báo của user hiện tại
	 */
	getMyNotifications: async (params?: QueryUserNotificationParams) => {
		const response = await axiosInstance.get<GetUserNotificationsResponse>(
			`${BASE}/my-notifications`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Lấy số lượng thông báo chưa đọc
	 */
	getUnreadCount: async () => {
		const response = await axiosInstance.get<UnreadCountResponse>(
			`${BASE}/my-notifications/unread-count`,
		);
		return response.data;
	},

	/**
	 * Lấy thống kê thông báo
	 */
	getMyStats: async () => {
		const response = await axiosInstance.get<UserNotificationStatsResponse>(
			`${BASE}/my-notifications/stats`,
		);
		return response.data;
	},

	/**
	 * Đánh dấu một thông báo là đã đọc
	 */
	markAsRead: async (notificationId: number) => {
		const response = await axiosInstance.put<MarkAsReadResponse>(
			`${BASE}/my-notifications/${notificationId}/read`,
		);
		return response.data;
	},

	/**
	 * Đánh dấu tất cả thông báo là đã đọc
	 */
	markAllAsRead: async () => {
		const response = await axiosInstance.put<MarkAsReadResponse>(
			`${BASE}/my-notifications/mark-all-read`,
		);
		return response.data;
	},

	/* =====================================================
     ADMIN APIs
  ===================================================== */

	/**
	 * [ADMIN] Gửi thông báo hệ thống
	 */
	sendNotification: async (data: SendSystemNotificationDto) => {
		const response = await axiosInstance.post(`${BASE}/send`, data);
		return response.data;
	},

	/**
	 * [ADMIN] Lấy thống kê thông báo
	 */
	getAdminStats: async () => {
		const response = await axiosInstance.get(`${BASE}/admin/stats`);
		return response.data;
	},

	/**
	 * [ADMIN] Lấy chi tiết thông báo
	 */
	getNotificationDetail: async (id: number) => {
		const response = await axiosInstance.get<SystemNotification>(
			`${BASE}/admin/${id}`,
		);
		return response.data;
	},
};

/* =====================================================
   Legacy named exports (for backward compatibility)
===================================================== */

export const getMyNotifications = async () => {
	const response = await axiosInstance.get(`${BASE}/my-notifications`);
	return response.data.data as SystemUserNotification[];
};

export const getUnreadNotificationCount = async () => {
	const response = await axiosInstance.get(
		`${BASE}/my-notifications/unread-count`,
	);
	return response.data as { unreadCount: number };
};

export const getMyNotificationStats = async () => {
	const response = await axiosInstance.get(`${BASE}/my-notifications/stats`);
	return response.data as { total: number; unread: number; read: number };
};

export const markNotificationAsRead = async (notificationId: number) => {
	await axiosInstance.put(`${BASE}/my-notifications/${notificationId}/read`);
	return notificationId;
};

export const markAllNotificationsAsRead = async () => {
	const response = await axiosInstance.put(
		`${BASE}/my-notifications/mark-all-read`,
	);
	return response.data;
};

export const sendSystemNotification = async (
	data: SendSystemNotificationDto,
) => {
	const response = await axiosInstance.post(`${BASE}/send`, data);
	return response.data;
};

export const getSystemNotificationStats = async () => {
	const response = await axiosInstance.get(`${BASE}/admin/stats`);
	return response.data;
};

export const getSystemNotificationDetail = async (id: number) => {
	const response = await axiosInstance.get<SystemNotification>(
		`${BASE}/admin/${id}`,
	);
	return response.data;
};
