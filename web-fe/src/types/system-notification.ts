// system-notification.interface.ts

import type { SystemNotificationPriorityType } from "@/constants/systemNotificationPriority";
import type { SystemNotificationType } from "@/constants/systemNotificationType";

export interface SystemUserNotification {
	id: number;

	userId: number;

	notificationId: number;

	/**
	 * Join entity
	 */
	notification?: SystemNotification;

	isRead: boolean;

	readAt?: Date | null;

	isDeleted: boolean;

	deletedAt?: Date | null;

	createdAt: Date;
}
export interface SystemNotification {
	id: number;

	title: string;

	content: string;

	type: SystemNotificationType;

	priority: SystemNotificationPriorityType;

	/**
	 * Danh sách user nhận thông báo
	 * null → broadcast toàn hệ thống
	 */
	targetUserIds?: number[] | null;

	/**
	 * Metadata mở rộng
	 * VD: { orderId, ticketId, redirect }
	 */
	metadata?: Record<string, any> | null;

	isSent: boolean;

	sentAt?: Date | null;

	scheduledFor?: Date | null;

	createdBy: number;

	actionUrl?: string | null;

	actionText?: string | null;

	/**
	 * Không bị auto xoá
	 */
	isPersistent: boolean;

	expiresAt?: Date | null;

	createdAt: Date;

	updatedAt: Date;

	/**
	 * Đường dẫn điều hướng khi click vào thông báo
	 * Được tính toán từ actionUrl hoặc metadata
	 */
	navigationPath?: string | null;

	/**
	 * Dữ liệu bổ sung cho việc điều hướng
	 */
	navigationData?: Record<string, any>;
}

// API Response types
export interface GetUserNotificationsResponse {
	data: SystemUserNotification[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		currentPage: number;
	};
}

export interface UnreadCountResponse {
	unreadCount: number;
}

export interface UserNotificationStatsResponse {
	total: number;
	unread: number;
	read: number;
	byType: Record<SystemNotificationType, number>;
	byPriority: Record<SystemNotificationPriorityType, number>;
}

export interface MarkAsReadResponse {
	success: boolean;
	message: string;
}
