import type { TableColumn } from "@/types";
import type { VotingData } from "@/types/voting";
import StatusBadge from "@/components/common/StatusBadge";
import { format, differenceInCalendarDays } from "date-fns";
import { Clock } from "lucide-react";

const statusMap: Record<string, { label: string; className: string }> = {
	ONGOING: {
		label: "Đang diễn ra",
		className: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
	},
	ENDED: {
		label: "Đã kết thúc",
		className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
	},
	UPCOMING: {
		label: "Sắp diễn ra",
		className: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
	},
};

const natureMap: Record<string, { label: string; className: string }> = {
	true: {
		label: "Bắt buộc",
		className: "text-red-600",
	},
	false: {
		label: "Tự nguyện",
		className: "text-blue-600",
	},
};

export const votingColumns: TableColumn<VotingData>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{
		key: "title",
		label: "Tiêu đề",
		width: "11%",
		sortable: true,
		align: "left",
		render: (row) => {
			const startTime = new Date(row.startTime);
			const now = new Date();

			// tính số ngày theo lịch
			const daysLeft = differenceInCalendarDays(startTime, now);
			const shouldShowBadge = row.status === "UPCOMING" && daysLeft >= 0;

			return (
				<div className="flex flex-col gap-1.5">
					<span title={row.title}>{row.title}</span>

					{shouldShowBadge && (
						<div className="flex items-center gap-1 text-[12px] text-yellow-600">
							<Clock className="w-3 h-3" />
							<span>
								{daysLeft === 0
									? "Diễn ra hôm nay"
									: daysLeft === 1
										? "Ngày mai diễn ra"
										: `Còn ${daysLeft} ngày nữa`}
							</span>
						</div>
					)}
				</div>
			);
		},
	},
	{
		key: "scopeDisplay",
		label: "Phạm vi biểu quyết",
		filterable: true,
		width: "12%",
	},
	{
		key: "startTime",
		label: "Ngày bắt đầu",
		sortable: true,
		align: "center",
		render: (row) => (
			<span>
				{row.startTime
					? format(new Date(row.startTime), "dd/MM/yyyy HH:mm")
					: "-"}
			</span>
		),
	},
	{
		key: "isRequired",
		label: "Tính chất",
		align: "center",
		filterable: true,
		filterAccessor: (row) => (row.isRequired ? "Bắt buộc" : "Tự nguyện"),
		render: (row) => {
			const config = natureMap[String(row.isRequired)];
			return <span className={`${config.className}`}>{config.label}</span>;
		},
	},
	{
		key: "votingRatio",
		label: "Tham gia",
		align: "center",
		width: "9%",
		render: (row) => (
			<span>{row.votingRatio ? `${row.votingRatio} cư dân` : "-"}</span>
		),
	},
	{
		key: "status",
		label: "Trạng thái",
		width: "15%",
		align: "center",
		filterable: true,
		filterAccessor: (row) => statusMap[row.status]?.label,
		render: (row) => {
			const config = statusMap[row.status] || {
				label: row.status,
				className: "bg-gray-100",
			};
			return <StatusBadge label={config.label} className={config.className} />;
		},
	},

	{
		key: "leadingOption",
		label: "Phương án dẫn đầu",
		width: "13%",
		align: "left",
		render: (row) => row.leadingOption || "-",
	},
];
