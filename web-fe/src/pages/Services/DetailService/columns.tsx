import type { TableColumn } from "@/types";
import StatusBadge from "@components/common/StatusBadge";
import type { BookingRow } from "@/types/service";
import { formatVND } from "@/utils/money";

const statusMap: Record<
	string,
	{ label: string; type?: "success" | "warning" | "error" }
> = {
	PENDING: { label: "Chờ xác nhận", type: "warning" },
	CONFIRMED: { label: "Đã xác nhận", type: "success" },
	COMPLETED: { label: "Hoàn thành", type: "success" },
	CANCELLED: { label: "Đã huỷ", type: "error" },
	PAID: { label: "Đã thanh toán", type: "success" },
	EXPIRED: { label: "Hết hạn", type: "error" },
};

const formatDateTimeVN = (iso: string) => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString("vi-VN");
};
const formatDDMMYYYYFromYMD = (ymd: string) => {
	// ymd: "2026-01-18"
	if (!ymd) return "—";
	const [yyyy, mm, dd] = ymd.split("-");
	if (!yyyy || !mm || !dd) return "—";
	return `${dd}/${mm}/${yyyy}`;
};

export const bookingColumns: TableColumn<BookingRow>[] = [
	{ key: "stt", label: "STT", align: "center", width: "60px" },

	{ key: "residentName", label: "Tên khách", sortable: true, width: "180px" },
	{ key: "phoneNumber", label: "Số điện thoại", width: "140px" },

	{
		key: "createdAt",
		label: "Ngày đặt",
		sortable: true,
		width: "160px",
		align: "center",
		render: (row) => formatDateTimeVN(row.createdAt),
	},

	{
		key: "bookingDate",
		label: "Ngày nhận",
		sortable: true,
		width: "140px",
		align: "center",
		render: (row) => formatDDMMYYYYFromYMD(row.bookingDate),
	},

	{
		key: "unitPrice",
		label: "Đơn giá",
		sortable: true,
		width: "110px",
		align: "center",
		render: (row) => formatVND(row.unitPrice),
	},

	{ key: "startTime", label: "Giờ vào", width: "90px", align: "center" },
	{ key: "endTime", label: "Giờ ra", width: "90px", align: "center" },

	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "160px",
		filterable: true,
		filterAccessor: (row) =>
			row.statusLabel ??
			statusMap[String(row.status)]?.label ??
			String(row.status),
		render: (row) => {
			const config = statusMap[String(row.status)] ?? {
				label: row.statusLabel ?? String(row.status),
			};
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},
];
