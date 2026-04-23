import { Info } from "lucide-react";
import type { TableColumn } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";
import type { NotificationData } from "@/types/notification";
import { format, isPast } from "date-fns";

const typeMap: Record<string, { label: string; className: string }> = {
	MAINTENANCE: {
		label: "Bảo trì",
		className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
	},
	GENERAL: {
		label: "Thông báo chung",
		className: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
	},
	WARNING: {
		label: "Cảnh báo",
		className: "bg-orange-100 text-orange-700 hover:bg-orange-100/80",
	},
	POLICY: {
		label: "Chính sách",
		className: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
	},
	default: {
		label: "Khác",
		className: "bg-gray-100 text-gray-700",
	},
};

export const notificationColumns: TableColumn<NotificationData>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{
		key: "title",
		label: "Tiêu đề",
		width: "20%",
		filterable: true,
		sortable: true,
		filterAccessor: (row) => (row.isUrgent ? "Thông báo khẩn" : "Thường"),
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span title={row.title}>{row.title}</span>
				{row.isUrgent && (
					<div className="flex items-center gap-1 text-[12px] text-orange-600">
						<Info className="w-3 h-3" />
						<span>Thông báo khẩn</span>
					</div>
				)}
			</div>
		),
	},
	{
		key: "targetScope",
		label: "Phạm vi",
		filterable: true,

		filterAccessor: (row) => {
			switch (row.targetScope) {
				case "ALL":
					return "Toàn chung cư";
				case "BLOCK":
					return "Theo tòa";
				case "FLOOR":
					return "Theo tầng";
				default:
					return "";
			}
		},

		render: (row) => {
			switch (row.targetScope) {
				case "ALL":
					return <span>Toàn chung cư</span>;
				case "BLOCK":
					return <span>Theo tòa</span>;
				case "FLOOR":
					return <span>Theo tầng</span>;
				default:
					return null;
			}
		},
	},
	{
		key: "publishedAt",
		label: "Thời gian đăng",
		sortable: true,
		align: "center",
		render: (row) => {
			if (!row.publishedAt) return <span>-</span>;

			const date = new Date(row.publishedAt);
			if (isNaN(date.getTime())) return <span>-</span>;

			return <span>{format(date, "dd/MM/yyyy HH:mm")}</span>;
		},
	},
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "20%",
		filterable: true,

		filterAccessor: (row) => {
			const isSent = isPast(new Date(row.publishedAt));
			return isSent ? "Đã thông báo" : "Chưa thông báo";
		},

		render: (row) => {
			const publishDate = new Date(row.publishedAt);
			const isSent = isPast(publishDate);

			return (
				<span
					className={`font-medium ${isSent ? "text-green-600" : "text-purple-600"}`}
				>
					{isSent ? "Đã thông báo" : "Chưa thông báo"}
				</span>
			);
		},
	},
	{
		key: "type",
		label: "Loại nội dung",
		align: "center",
		width: "20%",
		filterable: true,
		filterAccessor: (row) => typeMap[row.type]?.label || "Khác",
		render: (row) => {
			const config = typeMap[row.type] || typeMap.default;
			return <StatusBadge label={config.label} className={config.className} />;
		},
	},
];
