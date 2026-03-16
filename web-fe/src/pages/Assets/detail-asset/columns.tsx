import type { TableColumn } from "@/types";

export const maintenanceColumns: TableColumn<any>[] = [
	{
		key: "maintenanceDate",
		label: "Ngày bảo trì",
		sortable: true,
		render: (row) => new Date(row.maintenanceDate).toLocaleDateString("vi-VN"),
	},
	{ key: "title", label: "Tiêu đề" },
	{
		key: "maintenanceType",
		label: "Loại bảo trì",
		align: "center",
	},
	{
		key: "technicianName",
		label: "Kỹ thuật viên",
	},
	{
		key: "cost",
		label: "Chi phí thực hiện",
		align: "right",
		render: (row) => row.cost.toLocaleString("vi-VN") + " đ",
	},
];
