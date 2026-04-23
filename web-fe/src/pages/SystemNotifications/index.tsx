"use client";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	BellOff,
	CheckCheck,
	Mail,
	MailOpen,
	AlertCircle,
	Info,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import PageHeader from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { TabNavigation } from "@/components/common/TabNavigation";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
	useSystemNotifications,
	useMarkAsRead,
	useMarkAllAsRead,
} from "@/hooks/data/useSystemNotifications";
import type {
	SystemUserNotification,
	SystemNotification,
} from "@/types/system-notification";
import type { TabItem } from "@/types";
import { normalizeString } from "@/utils/string";
import { useAppDispatch } from "@/store/hooks";
import {
	markOneRead,
	markAllRead,
	initializeNotifications,
} from "@/store/slices/notificationSlice";

const SystemNotificationsPage = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState<string>("ALL");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading } = useSystemNotifications({
		page: 1,
		limit: 1000, // Lấy tất cả để filter ở client
		isRead:
			activeTab === "READ" ? true : activeTab === "UNREAD" ? false : undefined,
	});

	const { mutate: markAsRead } = useMarkAsRead();
	const { mutate: markAllAsRead } = useMarkAllAsRead();

	const notifications = data?.data || [];

	// Initialize notifications in Redux
	useEffect(() => {
		if (notifications.length > 0) {
			dispatch(initializeNotifications(notifications));
		}
	}, [notifications, dispatch]);

	const filteredNotifications = useMemo(() => {
		let result = [...notifications];

		// Filter by tab
		if (activeTab === "READ") {
			result = result.filter((n) => n.isRead);
		} else if (activeTab === "UNREAD") {
			result = result.filter((n) => !n.isRead);
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter((item) => {
				const title = normalizeString(item.notification?.title || "");
				const content = normalizeString(item.notification?.content || "");
				return title.includes(search) || content.includes(search);
			});
		}

		return result;
	}, [notifications, searchTerm, activeTab]);

	// Pagination logic
	const totalPages = Math.ceil(filteredNotifications.length / pageSize);
	const paginatedNotifications = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredNotifications.slice(startIndex, endIndex);
	}, [filteredNotifications, currentPage, pageSize]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [activeTab, searchTerm, pageSize]);

	const tabs: TabItem[] = useMemo(() => {
		const unreadCount = notifications.filter((n) => !n.isRead).length;
		const readCount = notifications.filter((n) => n.isRead).length;

		return [
			{ id: "ALL", label: "Tất cả", count: notifications.length },
			{ id: "UNREAD", label: "Chưa đọc", count: unreadCount },
			{ id: "READ", label: "Đã đọc", count: readCount },
		];
	}, [notifications]);

	const handleNotificationClick = (userNotif: SystemUserNotification) => {
		// Mark as read if not already
		if (!userNotif.isRead) {
			markAsRead(userNotif.notificationId, {
				onSuccess: () => {
					// Update Redux store
					dispatch(markOneRead(userNotif.id));
				},
			});
		}

		// Navigate if there's a navigation path
		if (userNotif.notification?.navigationPath) {
			navigate(userNotif.notification.navigationPath);
		}
	};

	const handleMarkAllRead = () => {
		markAllAsRead(undefined, {
			onSuccess: () => {
				// Update Redux store
				dispatch(markAllRead());
			},
		});
	};

	const getNotificationIcon = (notification?: SystemNotification) => {
		if (!notification) return <Info className="h-5 w-5 text-gray-400" />;

		switch (notification.type) {
			case "ERROR":
				return <AlertCircle className="h-5 w-5 text-red-500" />;
			case "WARNING":
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case "SUCCESS":
				return <CheckCircle2 className="h-5 w-5 text-green-500" />;
			case "INFO":
			case "SYSTEM":
			default:
				return <Info className="h-5 w-5 text-blue-500" />;
		}
	};

	const getPriorityBadge = (notification?: SystemNotification) => {
		if (!notification) return null;

		const priorityConfig = {
			URGENT: { label: "Khẩn cấp", variant: "destructive" as const },
			HIGH: { label: "Cao", variant: "default" as const },
			NORMAL: { label: "Bình thường", variant: "secondary" as const },
			LOW: { label: "Thấp", variant: "outline" as const },
		};

		const config =
			priorityConfig[notification.priority] || priorityConfig.NORMAL;
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader
				title="Thông báo hệ thống"
				subtitle="Quản lý và theo dõi thông báo của bạn"
				actions={
					<Button
						onClick={handleMarkAllRead}
						variant="outline"
						disabled={notifications.every((n) => n.isRead)}
						className="flex items-center gap-2"
					>
						<CheckCheck className="w-4 h-4" />
						Đánh dấu tất cả đã đọc
					</Button>
				}
			/>

			<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
				<SearchBar
					placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung..."
					onSearch={setSearchTerm}
				/>
				<TabNavigation
					tabs={tabs}
					activeTab={activeTab}
					onChange={(id) => {
						setActiveTab(id);
						setSearchTerm("");
					}}
				/>
			</div>

			<div className="min-h-[400px]">
				{isLoading ? (
					<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
						Đang tải thông báo...
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-sm text-gray-500 gap-2">
						<BellOff className="h-16 w-16 mb-4" />
						<p className="text-lg font-medium">Không có thông báo</p>
					</div>
				) : (
					<>
						<div className="bg-white border border-gray-200 rounded-sm shadow-sm">
							<div className="divide-y divide-gray-100">
								{paginatedNotifications.map((userNotif) => (
									<div
										key={userNotif.id}
										className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
											!userNotif.isRead ? "bg-blue-50/30" : ""
										}`}
										onClick={() => handleNotificationClick(userNotif)}
									>
										<div className="flex items-start gap-4">
											<div className="mt-1 flex-shrink-0">
												{getNotificationIcon(userNotif.notification)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-1">
													<h3
														className={`font-semibold text-base ${!userNotif.isRead ? "text-gray-900" : "text-gray-700"}`}
													>
														{userNotif.notification?.title}
													</h3>
													<div className="flex items-center gap-2 flex-shrink-0">
														{getPriorityBadge(userNotif.notification)}
														{!userNotif.isRead ? (
															<Mail className="h-4 w-4 text-blue-500" />
														) : (
															<MailOpen className="h-4 w-4 text-gray-400" />
														)}
													</div>
												</div>

												<p className="text-sm text-gray-600 mb-2 line-clamp-2">
													{userNotif.notification?.content}
												</p>

												<div className="flex items-center justify-between text-xs text-gray-500">
													<span>
														{formatDistanceToNow(
															new Date(userNotif.createdAt),
															{
																addSuffix: true,
																locale: vi,
															},
														)}
													</span>

													{userNotif.notification?.actionText && (
														<span className="text-blue-600 font-medium">
															{userNotif.notification.actionText}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="bg-white border border-gray-200 rounded-sm shadow-sm mt-4">
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									pageSize={pageSize}
									totalItems={filteredNotifications.length}
									onPageChange={setCurrentPage}
									onPageSizeChange={setPageSize}
									pageSizeOptions={[5, 10, 20, 50]}
									align="center"
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default SystemNotificationsPage;
