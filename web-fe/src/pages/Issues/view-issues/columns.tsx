import { format } from "date-fns";
import { Info, Eye, Edit, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import StatusBadge from "@/components/common/StatusBadge";
import { IssueStatusMap, IssueTypeMap } from "@/constants/issueStatus";

import type { TableColumn } from "@/types";
import type { IssueListItem } from "@/types/issue";

interface ColumnProps {
	onView: (item: IssueListItem) => void;
	onEdit: (item: IssueListItem) => void;
	onReceive: (item: IssueListItem) => void;
	onReject: (item: IssueListItem) => void;
}

export const getIssueColumns = ({
	onView,
	onEdit,
	onReceive,
	onReject,
}: ColumnProps): TableColumn<IssueListItem>[] => [
	{ key: "stt", label: "STT", align: "center" },

	{
		key: "title",
		label: "Tiêu đề",
		width: "17%",
		sortable: true,
		filterable: true,
		filterAccessor: (row) => (row.isUrgent ? "Khẩn cấp" : "Bình thường"),
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span title={row.title}>{row.title}</span>
				{row.isUrgent && (
					<div className="flex items-center gap-1 text-[12px] text-orange-600 font-medium">
						<Info className="w-3 h-3" />
						<span>Khẩn cấp</span>
					</div>
				)}
			</div>
		),
	},

	{
		key: "reporter",
		label: "Cư dân phản ánh",
		width: "12%",
		render: (row) => (
			<div className="flex flex-col">
				<span>{row.reporter?.fullName || "Ẩn danh"}</span>
				<span className="text-xs mt-0.5 text-gray-500">
					{row.reporter?.phoneNumber}
				</span>
			</div>
		),
	},

	{
		key: "type",
		label: "Loại sự cố",
		width: "15%",
		align: "center",
		filterable: true,
		filterAccessor: (row) => IssueTypeMap[row.type]?.label,
		render: (row) => {
			const label = IssueTypeMap[row.type]?.label || "Khác";
			return <span>{label}</span>;
		},
	},

	{
		key: "location",
		label: "Vị trí",
		width: "12%",
		sortable: true,
		render: (row) => {
			const blockName = row.block?.name || "Chưa rõ";
			const floorName = row.floor ? `Tầng ${row.floor}` : "";
			return (
				<span>
					{blockName} {floorName && `- ${floorName}`}
				</span>
			);
		},
	},

	{
		key: "createdAt",
		label: "Thời gian phản ánh",
		sortable: true,
		align: "center",
		render: (row) => {
			if (!row.createdAt) return <span>-</span>;

			const date = new Date(row.createdAt);
			if (isNaN(date.getTime())) return <span>-</span>;

			return <span>{format(date, "dd/MM/yyyy HH:mm")}</span>;
		},
	},

	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "15%",
		filterable: true,
		filterAccessor: (row) => IssueStatusMap[row.status]?.label,
		render: (row) => {
			const config = IssueStatusMap[row.status] || {
				label: row.status,
				type: "default",
			};
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},

	{
		key: "actions",
		label: "Thao tác",
		align: "center",
		width: "140px",
		render: (row) => {
			if (row.status === "PENDING") {
				return (
					<div className="flex items-center justify-center gap-1.5">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-gray-500 hover:text-purple-700 hover:bg-purple-50"
							onClick={() => onReceive(row)}
							title="Tiếp nhận"
						>
							<CheckCircle2 className="w-4 h-4" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-gray-500 hover:text-red-700 hover:bg-red-50"
							onClick={() => onReject(row)}
							title="Từ chối"
						>
							<XCircle className="w-4 h-4" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => onView(row)}
							className="h-8 w-8 text-gray-500 hover:text-main hover:bg-main/10"
							title="Xem"
						>
							<Eye className="w-4 h-4 stroke-[2]" />
						</Button>
					</div>
				);
			}

			return (
				<div className="flex items-center justify-center gap-1.5">
					{row.status !== "REJECTED" && row.status !== "RESOLVED" && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(row)}
							className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
							title="Sửa"
						>
							<Edit className="w-4 h-4 stroke-[2]" />
						</Button>
					)}

					<Button
						variant="ghost"
						size="icon"
						onClick={() => onView(row)}
						className="h-8 w-8 text-gray-500 hover:text-main hover:bg-main/10"
						title="Xem"
					>
						<Eye className="w-4 h-4 stroke-[2]" />
					</Button>
				</div>
			);
		},
	},
];
