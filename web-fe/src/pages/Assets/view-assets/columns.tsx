import type { TableColumn } from "@/types";
import type { Asset } from "@/types/asset";
import StatusBadge from "@components/common/StatusBadge";

const statusMap: Record<
	string,
	{
		label: string;
		type?: "success" | "warning" | "error" | "default";
		className?: string;
	}
> = {
	"Hoạt động": { label: "Hoạt động", type: "success" },
	Hỏng: { label: "Hỏng", type: "error" },
	"Bảo trì": { label: "Đang bảo trì", type: "warning" },
};

export const assetColumns: TableColumn<Asset>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "name", label: "Tên tài sản", sortable: true },
	{ key: "typeName", label: "Loại thiết bị", sortable: true, filterable: true },
	{
		key: "locationDetail",
		label: "Vị trí",
		render: (row) =>
			`${row.blockName} - Tầng ${row.floor} (${row.locationDetail})`,
	},
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "150px",
		render: (row) => {
			const config = statusMap[row.status] || {
				label: row.status,
				type: "default",
			};
			return (
				<StatusBadge
					label={config.label}
					type={config.type}
					className={config.className}
				/>
			);
		},
	},
	{
		key: "nextMaintenanceDate",
		label: "Bảo trì định kỳ",
		sortable: true,
		render: (row) =>
			new Date(row.nextMaintenanceDate).toLocaleDateString("vi-VN"),
	},
	{
		key: "isWarrantyValid",
		label: "Bảo hành",
		align: "center",
		render: (row) =>
			row.isWarrantyValid ? (
				<span className="text-green-600 text-xs">Còn hạn</span>
			) : (
				<span className="text-red-400 text-xs">Hết hạn</span>
			),
	},
];
