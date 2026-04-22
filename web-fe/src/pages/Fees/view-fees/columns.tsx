import type { TableColumn } from "@/types";
import type { Fee } from "@/types/fee";

export const feeColumns: TableColumn<Fee>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "name", label: "Tên phí", sortable: true },
	{ key: "unit", label: "Đơn vị", align: "center", sortable: true },
	{
		key: "type",
		label: "Loại phí",
		sortable: true,
		filterable: true,
		render: (row) => {
			const typeMap: Record<string, string> = {
				METERED: "Theo chỉ số",
				FIXED: "Cố định",
				FIXED_AREA: "Cố định theo diện tích",
				FIXED_MONTH: "Cố định hàng tháng",
				OTHER: "Khác",
			};
			return typeMap[row.type] || row.type;
		},
	},
	{
		key: "tierCount",
		label: "Số bậc",
		align: "center",
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		sortable: true,
		render: (row) => {
			return new Date(row.createdAt).toLocaleDateString("vi-VN");
		},
	},
];
