import type { TableColumn } from "@/types";
import type { MaintenanceTicketListItem } from "@/types/maintenance";
import StatusBadge from "@components/common/StatusBadge";
import { TicketStatusMap } from "@/constants/ticketStatus";

export const maintenanceColumns: TableColumn<MaintenanceTicketListItem>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "title", label: "Tiêu đề", sortable: true },
	{
		key: "blockName",
		label: "Tòa nhà",
		width: "150px",
		filterable: true,
	},
	{
		key: "assetName",
		label: "Tài sản",
		render: (row) => row.assetName || "-",
	},
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "150px",
		filterable: true,
		render: (row) => {
			const config = TicketStatusMap[row?.status!] ?? {
				label: "Không xác định",
				type: "default",
			};
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		align: "center",
		sortable: true,
		render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
	},
];
