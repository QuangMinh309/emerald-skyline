import type { TableColumn } from "@/types";
import type { InvoiceDetailWithMeterReadings } from "@/types/invoice";
import { formatVND } from "@/utils/money";

export const clientInvoiceColumns: TableColumn<InvoiceDetailWithMeterReadings>[] =
	[
		{ key: "stt", label: "STT", align: "center" },
		{ key: "invoiceCode", label: "Mã hóa đơn", sortable: true },
		{
			key: "apartment.name",
			label: "Căn hộ",
			sortable: true,
			align: "center",
			render: (row) => row.apartment?.name || `#${row.apartmentId}`,
		},
		{
			key: "period",
			label: "Kỳ thanh toán",
			sortable: true,
			render: (row) =>
				new Date(row.period).toLocaleDateString("vi-VN", {
					year: "numeric",
					month: "2-digit",
				}),
		},
		{
			key: "meterReadingsVerified",
			label: "Chỉ số đã xác nhận",
			filterable: true,
			render: (row) =>
				row.meterReadingsVerified ? "Đã xác nhận" : "Chưa xác nhận",
		},
		{
			key: "totalAmount",
			label: "Tổng tiền",
			align: "right",
			sortable: true,
			render: (row) => formatVND(Number(row.totalAmount)),
		},
	];
