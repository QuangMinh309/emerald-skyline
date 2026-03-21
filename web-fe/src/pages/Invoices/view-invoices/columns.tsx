import type { TableColumn } from "@/types";
import type { Invoice } from "@/types/invoice";
import StatusBadge from "@components/common/StatusBadge";
import { InvoiceStatusMap } from "@/constants/invoiceStatus";
import { formatVND } from "@/utils/money";

export const invoiceColumns: TableColumn<Invoice>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "invoiceCode", label: "Mã hóa đơn", sortable: true },
	{ key: "apartmentId", label: "Mã căn hộ", sortable: true, align: "center" },
	{
		key: "period",
		label: "Kỳ thanh toán",
		align: "center",
		sortable: true,
		render: (row) => {
			const d = new Date(row.period);
			const month = String(d.getMonth() + 1).padStart(2, "0");
			const year = d.getFullYear();
			return `${month}/${year}`;
		},
	},
	{
		key: "totalAmount",
		label: "Tổng tiền",
		align: "center",
		sortable: true,
		render: (row) => formatVND(Number(row.totalAmount)),
	},
	{
		key: "status",
		label: "Trạng thái",
		filterable: true,
		align: "center",
		width: "150px",
		filterAccessor: (row) => InvoiceStatusMap[row.status].label,
		render: (row) => {
			const config = InvoiceStatusMap[row.status];
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
