import { ApartmentStatusMap } from "@/constants/apartmentStatus";
import type { TableColumn } from "@/types";
import type { Apartment } from "@/types/apartment";
import StatusBadge from "@components/common/StatusBadge";

export const apartmentColumns: TableColumn<Apartment>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "roomName", label: "Mã căn hộ", sortable: true },
	{ key: "type", label: "Loại", sortable: true, filterable: true },
	{
		key: "block",
		label: "Tòa nhà",
		sortable: true,
	},
	{
		key: "floor",
		label: "Tầng",
		align: "center",
		sortable: true,
	},
	{
		key: "area",
		label: "Diện tích (m²)",
		align: "center",
		render: (row) => row.area,
	},
	{
		key: "owner",
		label: "Chủ hộ",
		sortable: true,
	},
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "150px",
		render: (row) => {
			const config = ApartmentStatusMap[row?.status!] ?? {
				label: "Không xác định",
				type: "default",
			};
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},
];
