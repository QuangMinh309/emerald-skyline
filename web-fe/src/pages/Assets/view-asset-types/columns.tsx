import type { TableColumn } from "@/types";
import type { AssetType } from "@/types/asset";

export const assetTypeColumns: TableColumn<AssetType>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "name", label: "Tên loại tài sản", sortable: true },
	{
		key: "description",
		label: "Mô tả",
		sortable: true,
		render: (row) =>
			row.description || (
				<span className="text-gray-400 italic">Chưa có mô tả</span>
			),
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		sortable: true,
		render: (row) =>
			row.createdAt ? (
				new Date(row.createdAt).toLocaleDateString("vi-VN")
			) : (
				<span className="text-gray-400">-</span>
			),
	},
	{
		key: "updatedAt",
		label: "Cập nhật lần cuối",
		sortable: true,
		render: (row) =>
			row.updatedAt ? (
				new Date(row.updatedAt).toLocaleDateString("vi-VN")
			) : (
				<span className="text-gray-400">-</span>
			),
	},
];
