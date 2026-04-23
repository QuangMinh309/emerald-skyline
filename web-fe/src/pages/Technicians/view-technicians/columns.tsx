import { TechnicianStatusMap } from "@/constants/technicianStatus";
import type { TableColumn } from "@/types";
import type { Technician } from "@/types/technician";
import StatusBadge from "@components/common/StatusBadge";

export const technicianColumns: TableColumn<Technician>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "fullName", label: "Họ và tên", sortable: true },
	{ key: "phoneNumber", label: "Số điện thoại", sortable: true },
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "150px",
		render: (row) => {
			const config = TechnicianStatusMap[row?.status!] ?? {
				label: "Không xác định",
				type: "default",
			};
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},
	{
		key: "description",
		label: "Mô tả",
		render: (row) => row.description || "-",
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		align: "center",
		sortable: true,
		render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
	},
];
