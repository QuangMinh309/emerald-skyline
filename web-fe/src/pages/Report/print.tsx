/* PrintableDashboardReport.tsx */
import type { DashboardReport } from "@/types/report";

type DashboardReportResponse = {
	statusCode?: number;
	message?: string;
	data: DashboardReport;
	timestamp?: string;
	path?: string;
	takenTime?: string;
};

interface PrintableDashboardReportProps {
	/**
	 * Có thể truyền:
	 * - response wrapper { data, path, timestamp... }
	 * - hoặc truyền thẳng data (DashboardReport)
	 */
	report?: DashboardReportResponse | DashboardReport;
	title?: string;
}

const formatCurrencyVND = (value: number) =>
	new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) +
	" đ";

const formatPercent = (value: number) => `${value}%`;

const formatDateVI = (isoDate: string) => {
	const d = new Date(isoDate);
	if (Number.isNaN(d.getTime())) return isoDate;
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const isResponseWrapper = (
	report: DashboardReportResponse | DashboardReport,
): report is DashboardReportResponse => {
	return typeof (report as DashboardReportResponse)?.data !== "undefined";
};

export const PrintableDashboardReport = ({
	report,
	title = "Báo Cáo Tổng Quan",
}: PrintableDashboardReportProps) => {
	const mainColor = "#244B35";
	const currentDate = new Date();
	if (!report) {
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
						{title}
					</h1>
					<p className="text-base font-medium italic text-gray-700">
						Ngày in: {currentDate.toLocaleDateString("vi-VN")} -{" "}
						{currentDate.toLocaleTimeString("vi-VN")}
					</p>
				</div>

				<div className="border border-black p-4 text-center italic">
					Không có dữ liệu để in.
				</div>
			</div>
		);
	}

	// ✅ Normalize: data luôn là DashboardReport
	const data: DashboardReport = isResponseWrapper(report)
		? report.data
		: report;

	// ✅ Fallback để không crash nếu API/old data thiếu mảng
	const revenueExpenseChart = data.revenueExpenseChart ?? [];
	const serviceBookingChart = data.serviceBookingChart ?? [];

	const totalRevenueExpense = revenueExpenseChart.reduce(
		(acc, item) => {
			acc.revenue += item?.revenue || 0;
			acc.expense += item?.expense || 0;
			return acc;
		},
		{ revenue: 0, expense: 0 },
	);

	// ✅ Backward-compatible: maintenanceAssets vs maintenancedAssets
	const maintenanceAssets =
		data.assetStatus?.maintenanceAssets ??
		data.assetStatus?.maintenancedAssets ??
		0;

	const workingAssets = data.assetStatus?.workingAssets ?? 0;
	const brokenAssets = data.assetStatus?.brokenAssets ?? 0;

	const totalAssets = workingAssets + maintenanceAssets + brokenAssets;

	return (
		<div
			className="hidden print:block p-8 bg-white text-black"
			style={{ fontFamily: '"Times New Roman", Times, serif' }}
		>
			{/* Header */}
			<div className="flex flex-col items-center mb-6">
				<h1
					className="text-xl font-bold uppercase mb-2"
					style={{ color: mainColor }}
				>
					{title}
				</h1>
				<p className="text-base font-medium italic text-gray-700">
					Ngày in: {currentDate.toLocaleDateString("vi-VN")} -{" "}
					{currentDate.toLocaleTimeString("vi-VN")}
				</p>

				{/* Meta: chỉ render khi có (khi report là wrapper) */}
				{isResponseWrapper(report) &&
					(report.path || report.timestamp || report.takenTime) && (
						<div className="mt-2 text-sm text-gray-700">
							{report.path && (
								<p>
									<span className="font-bold">API:</span> {report.path}
								</p>
							)}
							{(report.timestamp || report.takenTime) && (
								<p>
									{report.timestamp && (
										<>
											<span className="font-bold">Timestamp:</span>{" "}
											{report.timestamp}
										</>
									)}
									{report.timestamp && report.takenTime ? " | " : null}
									{report.takenTime && (
										<>
											<span className="font-bold">Taken:</span>{" "}
											{report.takenTime}
										</>
									)}
								</p>
							)}
						</div>
					)}
			</div>

			{/* I. Summary */}
			<div className="mb-5 break-inside-avoid">
				<h2 className="text-base font-bold mb-2" style={{ color: mainColor }}>
					I. Tổng quan số liệu
				</h2>

				<table className="w-full border-collapse border border-black text-sm">
					<thead>
						<tr className="bg-gray-200 print:bg-gray-200 font-bold">
							<th className="border border-black p-2 text-left">Chỉ tiêu</th>
							<th className="border border-black p-2 text-right w-56">
								Giá trị
							</th>
							<th className="border border-black p-2 text-left">Ghi chú</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border border-black p-2 font-medium">Doanh thu</td>
							<td className="border border-black p-2 text-right">
								{formatCurrencyVND(data.revenue?.totalRevenue ?? 0)}
							</td>
							<td className="border border-black p-2">
								So với tháng trước:{" "}
								<span className="font-bold">
									{formatPercent(
										data.revenue?.percentageComparedToPreviousMonth ?? 0,
									)}
								</span>
							</td>
						</tr>

						<tr>
							<td className="border border-black p-2 font-medium">Công nợ</td>
							<td className="border border-black p-2 text-right">
								{formatCurrencyVND(data.debt?.totalDebt ?? 0)}
							</td>
							<td className="border border-black p-2">
								Số căn hộ đang nợ:{" "}
								<span className="font-bold">
									{data.debt?.totalApartmentsOwing ?? 0}
								</span>
							</td>
						</tr>

						<tr>
							<td className="border border-black p-2 font-medium">
								Số tài sản đã bảo trì
							</td>
							<td className="border border-black p-2 text-right">
								{data.maintenance?.totalAssetsMaintenanced ?? 0}
							</td>
							{/* <td className="border border-black p-2">Tổng số tài sản đã/đang bảo trì</td> */}
						</tr>

						<tr>
							<td className="border border-black p-2 font-medium">
								Tổng tài sản
							</td>
							<td className="border border-black p-2 text-right">
								{totalAssets}
							</td>
							<td className="border border-black p-2">
								Hoạt động: <span className="font-bold">{workingAssets}</span> |
								Bảo trì: <span className="font-bold">{maintenanceAssets}</span>{" "}
								| Hư hỏng: <span className="font-bold">{brokenAssets}</span>
							</td>
						</tr>

						<tr>
							<td className="border border-black p-2 font-medium">
								Tổng thu/chi (theo biểu đồ)
							</td>
							<td className="border border-black p-2 text-right">
								{formatCurrencyVND(totalRevenueExpense.revenue)} /{" "}
								{formatCurrencyVND(totalRevenueExpense.expense)}
							</td>
							{/* <td className="border border-black p-2">Tổng cộng từ revenueExpenseChart</td> */}
						</tr>
					</tbody>
				</table>
			</div>

			{/* II. Revenue - Expense table */}
			<div className="mb-5 break-inside-avoid">
				<h2 className="text-base font-bold mb-2" style={{ color: mainColor }}>
					II. Chi tiết thu - chi theo ngày
				</h2>

				<table className="w-full border-collapse border border-black text-sm">
					<thead>
						<tr className="bg-gray-200 print:bg-gray-200 font-bold">
							<th className="border border-black p-2 text-center w-12">STT</th>
							<th className="border border-black p-2 text-left">Ngày</th>
							<th className="border border-black p-2 text-right w-56">
								Doanh thu
							</th>
							<th className="border border-black p-2 text-right w-56">
								Chi phí
							</th>
							<th className="border border-black p-2 text-right w-56">
								Chênh lệch
							</th>
						</tr>
					</thead>
					<tbody>
						{revenueExpenseChart.length > 0 ? (
							revenueExpenseChart.map((item, idx) => {
								const diff = (item.revenue || 0) - (item.expense || 0);
								return (
									<tr
										key={`${item.label}-${idx}`}
										className="break-inside-avoid"
									>
										<td className="border border-black p-2 text-center">
											{idx + 1}
										</td>
										<td className="border border-black p-2 font-medium">
											{formatDateVI(item.label)}
										</td>
										<td className="border border-black p-2 text-right">
											{formatCurrencyVND(item.revenue || 0)}
										</td>
										<td className="border border-black p-2 text-right">
											{formatCurrencyVND(item.expense || 0)}
										</td>
										<td className="border border-black p-2 text-right">
											{formatCurrencyVND(diff)}
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={5}
									className="border border-black p-4 text-center italic"
								>
									Không có dữ liệu hiển thị
								</td>
							</tr>
						)}
					</tbody>

					{revenueExpenseChart.length > 0 && (
						<tfoot>
							<tr className="font-bold bg-gray-100 print:bg-gray-100">
								<td colSpan={2} className="border border-black p-2 text-right">
									Tổng
								</td>
								<td className="border border-black p-2 text-right">
									{formatCurrencyVND(totalRevenueExpense.revenue)}
								</td>
								<td className="border border-black p-2 text-right">
									{formatCurrencyVND(totalRevenueExpense.expense)}
								</td>
								<td className="border border-black p-2 text-right">
									{formatCurrencyVND(
										totalRevenueExpense.revenue - totalRevenueExpense.expense,
									)}
								</td>
							</tr>
						</tfoot>
					)}
				</table>
			</div>

			{/* III. Service booking */}
			<div className="mb-5 break-inside-avoid">
				<h2 className="text-base font-bold mb-2" style={{ color: mainColor }}>
					III. Thống kê lượt đặt dịch vụ
				</h2>

				<table className="w-full border-collapse border border-black text-sm">
					<thead>
						<tr className="bg-gray-200 print:bg-gray-200 font-bold">
							<th className="border border-black p-2 text-center w-12">STT</th>
							<th className="border border-black p-2 text-left">Dịch vụ</th>
							<th className="border border-black p-2 text-right w-56">
								Số lượt đặt
							</th>
						</tr>
					</thead>
					<tbody>
						{serviceBookingChart.length > 0 ? (
							serviceBookingChart.map((s, idx) => (
								<tr
									key={`${s.serviceName}-${idx}`}
									className="break-inside-avoid"
								>
									<td className="border border-black p-2 text-center">
										{idx + 1}
									</td>
									<td className="border border-black p-2 font-medium">
										{s.serviceName}
									</td>
									<td className="border border-black p-2 text-right">
										{s.bookingCount}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={3}
									className="border border-black p-4 text-center italic"
								>
									Không có dữ liệu hiển thị
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Sign */}
			<div className="flex justify-between mt-12 px-8 break-inside-avoid">
				<div className="text-center">
					<p className="font-bold mb-16">Người lập biểu</p>
					<p className="italic text-sm">(Ký, họ tên)</p>
				</div>
				<div className="text-center">
					<p className="font-bold mb-16">Ban quản lý</p>
					<p className="italic text-sm">(Ký, họ tên, đóng dấu)</p>
				</div>
			</div>
		</div>
	);
};
