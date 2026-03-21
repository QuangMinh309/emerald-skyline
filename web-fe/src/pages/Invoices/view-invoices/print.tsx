import type { Invoice } from "@/types/invoice";
import { formatVND } from "@/utils/money";
import { InvoiceStatusMap } from "@/constants/invoiceStatus";

interface PrintableInvoiceListProps {
	data: Invoice[];
}

export const PrintableInvoiceList = ({ data }: PrintableInvoiceListProps) => {
	const mainColor = "#244B35";

	// tổng tiền (làm tròn trước khi cộng)
	const totalAmount = data.reduce(
		(sum, item) => sum + Math.round(Number(item.totalAmount)),
		0,
	);
	const currentDate = new Date();

	return (
		<div
			className="hidden print:block p-8 bg-white text-black"
			style={{ fontFamily: '"Times New Roman", Times, serif' }}
		>
			<div className="flex flex-col items-center mb-6">
				<h1
					className="text-xl font-bold uppercase mb-2"
					style={{ color: mainColor }}
				>
					Bảng Kê Danh Sách Công Nợ
				</h1>

				<p className="text-base font-medium italic text-gray-700">
					Ngày in: {currentDate.toLocaleDateString("vi-VN")} -{" "}
					{currentDate.toLocaleTimeString("vi-VN")}
				</p>
			</div>

			<table className="w-full border-collapse border border-black text-sm">
				<thead>
					<tr className="bg-gray-200 print:bg-gray-200 font-bold">
						<th className="border border-black p-2 text-center w-12">STT</th>
						<th className="border border-black p-2 text-left">Mã hóa đơn</th>
						<th className="border border-black p-2 text-center">Mã căn hộ</th>
						<th className="border border-black p-2 text-center">Kỳ TT</th>
						<th className="border border-black p-2 text-center">Trạng thái</th>
						<th className="border border-black p-2 text-center">Ngày tạo</th>
						<th className="border border-black p-2 text-right">Thành tiền</th>
					</tr>
				</thead>
				<tbody>
					{data.length > 0 ? (
						data.map((item, index) => {
							const d = new Date(item.period);
							const periodString = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
							const amount = Math.round(Number(item.totalAmount));

							return (
								<tr key={item.id} className="break-inside-avoid">
									<td className="border border-black p-2 text-center">
										{index + 1}
									</td>
									<td className="border border-black p-2 font-medium">
										{item.invoiceCode}
									</td>
									<td className="border border-black p-2 text-center">
										{item.apartmentId}
									</td>
									<td className="border border-black p-2 text-center">
										{periodString}
									</td>
									<td className="border border-black p-2 text-center">
										{InvoiceStatusMap[item.status]?.label || item.status}
									</td>
									<td className="border border-black p-2 text-center">
										{new Date(item.createdAt).toLocaleDateString("vi-VN")}
									</td>
									<td className="border border-black p-2 text-right font-medium">
										{formatVND(amount)} VNĐ
									</td>
								</tr>
							);
						})
					) : (
						<tr>
							<td
								colSpan={7}
								className="border border-black p-4 text-center italic"
							>
								Không có dữ liệu hiển thị
							</td>
						</tr>
					)}
				</tbody>

				<tfoot>
					<tr className="font-bold bg-gray-100 print:bg-gray-100">
						<td
							colSpan={6}
							className="border border-black p-2 text-right uppercase"
						>
							Tổng cộng
						</td>
						<td className="border border-black p-2 text-right whitespace-nowrap">
							{formatVND(totalAmount)} VNĐ
						</td>
					</tr>
				</tfoot>
			</table>

			<div className="flex justify-between mt-12 px-8 break-inside-avoid">
				<div className="text-center">
					<p className="font-bold mb-16">Người lập biểu</p>
					<p className="italic text-sm">(Ký, họ tên)</p>
				</div>
				<div className="text-center">
					<p className="font-bold mb-16">Kế toán trưởng</p>
					<p className="italic text-sm">(Ký, họ tên)</p>
				</div>
				<div className="text-center">
					<p className="font-bold mb-16">Giám đốc</p>
					<p className="italic text-sm">(Ký, họ tên, đóng dấu)</p>
				</div>
			</div>
		</div>
	);
};
