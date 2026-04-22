import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
	Eye,
	Mail,
	MailOpen,
	AlertCircle,
	Info,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import type { TableColumn } from "@/types";
import type {
	SystemUserNotification,
	SystemNotification,
} from "@/types/system-notification";

interface ColumnProps {
	onView: (item: SystemUserNotification) => void;
}

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

	const config = priorityConfig[notification.priority] || priorityConfig.NORMAL;
	return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const getSystemNotificationColumns = ({
	onView,
}: ColumnProps): TableColumn<SystemUserNotification>[] => [
	{ key: "stt", label: "STT", align: "center", width: "5%" },

	{
		key: "status",
		label: "TT",
		width: "5%",
		align: "center",
		render: (row) =>
			!row.isRead ? (
				<Mail className="h-4 w-4 text-blue-500 mx-auto" />
			) : (
				<MailOpen className="h-4 w-4 text-gray-400 mx-auto" />
			),
	},

	{
		key: "icon",
		label: "Loại",
		width: "5%",
		align: "center",
		render: (row) => (
			<div className="flex justify-center">
				{getNotificationIcon(row.notification)}
			</div>
		),
	},

	{
		key: "title",
		label: "Tiêu đề",
		width: "25%",
		sortable: true,
		render: (row) => (
			<div
				className={`flex flex-col gap-1 ${!row.isRead ? "font-semibold" : ""}`}
			>
				<span
					className={`${!row.isRead ? "text-gray-900" : "text-gray-700"}`}
					title={row.notification?.title}
				>
					{row.notification?.title}
				</span>
			</div>
		),
	},

	{
		key: "content",
		label: "Nội dung",
		width: "35%",
		render: (row) => (
			<p className="text-sm text-gray-600 line-clamp-2">
				{row.notification?.content}
			</p>
		),
	},

	{
		key: "priority",
		label: "Mức độ",
		width: "10%",
		align: "center",
		filterable: true,
		filterAccessor: (row) => {
			const priorityMap = {
				URGENT: "Khẩn cấp",
				HIGH: "Cao",
				NORMAL: "Bình thường",
				LOW: "Thấp",
			};
			return priorityMap[row.notification?.priority || "NORMAL"];
		},
		render: (row) => getPriorityBadge(row.notification),
	},

	{
		key: "createdAt",
		label: "Thời gian",
		width: "12%",
		sortable: true,
		align: "center",
		render: (row) => {
			if (!row.createdAt) return <span>-</span>;
			return (
				<span className="text-sm text-gray-600">
					{formatDistanceToNow(new Date(row.createdAt), {
						addSuffix: true,
						locale: vi,
					})}
				</span>
			);
		},
	},

	{
		key: "actions",
		label: "Thao tác",
		align: "center",
		width: "8%",
		render: (row) => (
			<div className="flex justify-center gap-1">
				<button
					onClick={(e) => {
						e.stopPropagation();
						onView(row);
					}}
					className="p-1.5 hover:bg-gray-100 rounded transition-colors"
					title="Xem chi tiết"
				>
					<Eye className="w-4 h-4 text-gray-600" />
				</button>
			</div>
		),
	},
];
