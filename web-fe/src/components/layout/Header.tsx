import type React from "react";
import { useState } from "react";
import { Bell, ChevronDown, LogOut, User, CheckCheck } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
	useMarkAllNotificationsAsRead,
	useMarkAsRead,
} from "@/hooks/data/useSystemNotifications";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
	userName?: string;
	userEmail?: string;
	avatarUrl?: string;
	onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
	userName = "Admin User",
	userEmail = "admin@emerald.com",
	avatarUrl,
	onLogout,
}) => {
	const [showDropdown, setShowDropdown] = useState(false);

	return (
		<div className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-end px-6 gap-4 fixed top-0 left-64 right-0 z-40 transition-all duration-300">
			<NotificationBell />
			<div className="relative">
				<button
					type="button"
					onClick={() => setShowDropdown(!showDropdown)}
					className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 pr-3 transition-colors border border-transparent hover:border-gray-200"
				>
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={userName}
							className="w-8 h-8 rounded-full object-cover border border-gray-200"
						/>
					) : (
						<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
							<User className="w-5 h-5 text-gray-500" />
						</div>
					)}
					<div className="text-left hidden sm:block">
						<p className="text-sm font-semibold text-gray-700 leading-none">
							{userName}
						</p>
					</div>
					<ChevronDown className="w-4 h-4 text-gray-500" />
				</button>

				{showDropdown && (
					<>
						<button
							type="button"
							className="fixed inset-0 z-10 cursor-default"
							onClick={() => setShowDropdown(false)}
						/>
						<div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
							<div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
								<p className="font-semibold text-sm text-gray-900">
									{userName}
								</p>
								<p className="text-xs text-gray-500 truncate">{userEmail}</p>
							</div>
							<div className="p-1">
								<button
									type="button"
									onClick={() => {
										setShowDropdown(false);
										onLogout?.();
									}}
									className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 rounded-md flex items-center gap-2 transition-colors"
								>
									<LogOut className="w-4 h-4" />
									Đăng xuất
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
const NotificationBell = () => {
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const [filter, setFilter] = useState<"all" | "unread">("all");
	const { items, unreadCount } = useAppSelector((state) => state.notification);
	const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
	const { mutate: markOneAsRead } = useMarkAsRead();
	// Filter notifications
	const filteredNotifications =
		filter === "unread" ? items.filter((n) => !n.isRead) : items;

	const getTypeColor = (type: string) => {
		const colorMap: Record<string, string> = {
			SUCCESS: "bg-green-50 border-green-200",
			WARNING: "bg-yellow-50 border-yellow-200",
			ERROR: "bg-red-50 border-red-200",
			INFO: "bg-blue-50 border-blue-200",
			SYSTEM: "bg-gray-50 border-gray-200",
		};
		return colorMap[type] || "bg-gray-50 border-gray-200";
	};

	const getTypeIcon = (type: string) => {
		const iconMap: Record<string, string> = {
			SUCCESS: "✓",
			WARNING: "⚠",
			ERROR: "✕",
			INFO: "ℹ",
			SYSTEM: "⚙",
		};
		return iconMap[type] || "●";
	};

	const getPriorityColor = (priority: string) => {
		const colorMap: Record<string, string> = {
			LOW: "text-gray-600",
			NORMAL: "text-blue-600",
			HIGH: "text-orange-600",
			URGENT: "text-red-600",
		};
		return colorMap[priority] || "text-gray-600";
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setShowDropdown(!showDropdown)}
				className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
			>
				<Bell className="w-5 h-5 text-gray-600" />
				{unreadCount > 0 && (
					<span className="cursor-pointer absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-semibold rounded-full flex items-center justify-center leading-none">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{showDropdown && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-10 cursor-default"
						onClick={() => setShowDropdown(false)}
					/>
					<div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-20 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
						{/* Header */}
						<div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-semibold text-gray-900">Thông báo</h3>
								<button
									type="button"
									onClick={() => setShowDropdown(false)}
									className="text-gray-500 hover:text-gray-700 text-lg"
								>
									✕
								</button>
							</div>

							{/* Filter tabs */}
							<div className="flex gap-2 mb-3">
								<button
									type="button"
									onClick={() => setFilter("all")}
									className={`px-3 py-1 text-sm rounded-md transition-colors ${
										filter === "all"
											? "bg-blue-100 text-blue-700 font-medium"
											: "text-gray-600 hover:bg-gray-100"
									}`}
								>
									Tất cả
								</button>
								<button
									type="button"
									onClick={() => setFilter("unread")}
									className={`px-3 py-1 text-sm rounded-md transition-colors ${
										filter === "unread"
											? "bg-blue-100 text-blue-700 font-medium"
											: "text-gray-600 hover:bg-gray-100"
									}`}
								>
									Chưa đọc ({unreadCount})
								</button>
							</div>

							{/* Mark all as read button */}
							{unreadCount > 0 && (
								<button
									onClick={() => markAllAsRead()}
									type="button"
									className="w-full text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
								>
									<CheckCheck className="w-4 h-4" />
									Đánh dấu tất cả đã đọc
								</button>
							)}
						</div>

						{/* Notifications list */}
						<div className="flex-1 overflow-y-auto">
							{filteredNotifications.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
									<Bell className="w-10 h-10 text-gray-300 mb-2" />
									<p className="text-gray-500 text-sm">
										{filter === "unread"
											? "Không có thông báo chưa đọc"
											: "Không có thông báo"}
									</p>
								</div>
							) : (
								<div className="divide-y divide-gray-100">
									{filteredNotifications.map((notification) => (
										<div
											onClick={() => {
												navigate(`/system-notifications`);
												markOneAsRead(notification.notificationId);
											}}
											key={notification.id}
											className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getTypeColor(
												notification.notification?.type || "INFO",
											)} ${!notification.isRead ? "bg-blue-50/30" : ""}`}
										>
											<div className="flex gap-2">
												{/* Type icon */}
												<div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold">
													{getTypeIcon(
														notification.notification?.type || "INFO",
													)}
												</div>

												<div className="flex-1 min-w-0">
													{/* Title and Priority */}
													<div className="flex items-start justify-between gap-2 mb-1">
														<h4 className="text-sm font-medium text-gray-900 line-clamp-1">
															{notification.notification?.title}
														</h4>
														{notification.notification?.priority &&
															notification.notification?.priority !==
																"NORMAL" && (
																<span
																	className={`text-[11px] font-medium whitespace-nowrap ${getPriorityColor(
																		notification.notification?.priority,
																	)}`}
																>
																	{notification.notification?.priority}
																</span>
															)}
													</div>

													{/* Content */}
													<p className="text-xs text-gray-600 line-clamp-2 mb-1">
														{notification.notification?.content}
													</p>

													{/* Footer with read indicator */}
													<div className="flex items-center justify-between gap-2">
														<span className="text-[11px] text-gray-400">
															{new Date(
																notification.createdAt,
															).toLocaleDateString("vi-VN")}
														</span>
														{!notification.isRead && (
															<span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};
export default Header;
