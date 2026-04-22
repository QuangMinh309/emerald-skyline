import { useState, useMemo, useEffect } from "react";
import PageHeader from "@components/common/PageHeader";
import ServicesBarChart, { type BarPoint } from "./components/ServiceBarChart";
import AssetStatusSummary from "./components/AssetStatus";
import RevenueExpenseChart, { type Point } from "./components/RevenueChart";
import StatCard from "../../components/common/StatCard";
import { TabNavigation } from "@/components/common/TabNavigation";
import { MonthPicker } from "./components/MonthPicker";
import { YearPicker } from "./components/YearPicker";
import { useReports } from "@/hooks/data/useReport";
import type { RangeType } from "@/types/report";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/common/Spinner";
import { PrintableDashboardReport } from "./print";
import ActionDropdown from "@/components/common/ActionDropdown";
import type { ActionOption } from "@/types";
import { Printer } from "lucide-react";

const DEFAULT_FROM = new Date(2025, 6, 1);
const DEFAULT_TO = new Date();
const TZ_OFFSET = "+07:00";

function pad2(n: number) {
	return String(n).padStart(2, "0");
}

function addDaysLocal(d: Date, days: number) {
	const x = new Date(d);
	x.setDate(x.getDate() + days);
	return x;
}

function toISOWithOffsetStart(d?: Date) {
	if (!d) return undefined;
	const yyyy = d.getFullYear();
	const mm = pad2(d.getMonth() + 1);
	const dd = pad2(d.getDate());
	return `${yyyy}-${mm}-${dd}T00:00:00.000${TZ_OFFSET}`;
}

function toISOWithOffsetEnd(d?: Date) {
	if (!d) return undefined;
	const yyyy = d.getFullYear();
	const mm = pad2(d.getMonth() + 1);
	const dd = pad2(d.getDate());
	return `${yyyy}-${mm}-${dd}T23:59:59.999${TZ_OFFSET}`;
}

function endOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfYear(year: number) {
	return new Date(year, 0, 1);
}
function endOfYear(year: number) {
	return new Date(year, 11, 31, 23, 59, 59, 999);
}

const ReportPage = () => {
	const navigate = useNavigate();
	const [periodTab, setPeriodTab] = useState<RangeType>("month");
	const [monthValue, setMonthValue] = useState(() => {
		const now = new Date();
		const mm = String(now.getMonth() + 1).padStart(2, "0");
		return `${now.getFullYear()}-${mm}`;
	});
	const [yearValue, setYearValue] = useState(() => {
		return String(new Date().getFullYear());
	});
	const [allFrom, setAllFrom] = useState<Date | undefined>(undefined);
	const [allTo, setAllTo] = useState<Date | undefined>(undefined);

	const dateRange = useMemo(() => {
		if (periodTab === "month") {
			const [y, m] = monthValue.split("-").map(Number);
			const from = new Date(y, (m ?? 1) - 1, 1);
			return { from: from, to: endOfMonth(from), label: `Tháng ${m}-${y}` };
		} else if (periodTab === "year") {
			const y = Number(yearValue);
			return { from: startOfYear(y), to: endOfYear(y), label: `Năm ${y}` };
		} else {
			const label =
				allFrom && allTo
					? `${allFrom.toLocaleDateString("vi-VN")} - ${allTo.toLocaleDateString("vi-VN")}`
					: "Tất cả";
			return { from: allFrom, to: allTo, label };
		}
	}, [periodTab, monthValue, yearValue, allFrom, allTo]);
	const reportParams = useMemo(() => {
		const fromRaw = periodTab === "custom" ? allFrom : dateRange.from;
		const toRaw = periodTab === "custom" ? allTo : dateRange.to;

		const fromShifted = fromRaw ? addDaysLocal(fromRaw, 1) : undefined;
		const toShifted = toRaw ? addDaysLocal(toRaw, 1) : undefined;

		return {
			startDate: toISOWithOffsetStart(fromShifted),
			endDate: toISOWithOffsetEnd(toShifted),
		};
	}, [periodTab, dateRange.from, dateRange.to, allFrom, allTo]);

	const { isLoading: authLoading, isAuthenticated } = useAuth();

	const { data, isLoading } = useReports(
		reportParams,
		!authLoading && isAuthenticated,
	);
	console.log(data);

	//totalrevenue: tổng invoce đã paid
	//totalDeb: tổng hoá đơn unpaid
	//totalMaintenance: tổng đã bẢO TRÌ

	//invoce paid
	//ticket completed

	const totalRevenue = data?.revenue?.totalRevenue || 0;
	const percentageComparedToPreviousMonth =
		data?.revenue?.percentageComparedToPreviousMonth || 0;

	const totalDebt = data?.debt?.totalDebt || 0;
	const totalApartmentsOwing = data?.debt?.totalApartmentsOwing || 0;

	const totalAssetsMaintenanced =
		data?.maintenance?.totalAssetsMaintenanced || 0;

	const revenuePoints: Point[] =
		data?.revenueExpenseChart?.map((d) => ({
			label: d.label,
			value: d.revenue ?? 0,
		})) ?? [];

	const expensePoints: Point[] =
		data?.revenueExpenseChart?.map((d) => ({
			label: d.label,
			value: d.expense ?? 0,
		})) ?? [];

	const servicePoints: BarPoint[] =
		data?.serviceBookingChart?.map((d) => ({
			label: d.serviceName,
			value: d.bookingCount ?? 0,
		})) ?? [];

	const assetStatus = data?.assetStatus;
	const hasDataRevenue =
		data?.revenueExpenseChart && data.revenueExpenseChart.length > 0;
	useEffect(() => {
		if (periodTab === "custom") {
			setAllFrom((v) => v ?? DEFAULT_FROM);
			setAllTo((v) => v ?? DEFAULT_TO);
		}
	}, [periodTab]);
	const actions: ActionOption[] = useMemo(
		() => [
			{
				id: "print",
				label: "In danh sách",
				icon: <Printer className="w-4 h-4" />,
				onClick: () => window.print(),
				disabled: !hasDataRevenue,
			},
		],
		[data?.revenueExpenseChart],
	);
	const printTitle = useMemo(
		() => `BÁO CÁO TỔNG HỢP ${dateRange.label}`,
		[dateRange.label],
	);

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<div className="print-area">
				<PrintableDashboardReport report={data} title={printTitle} />
			</div>
			<div className="print-hide">
				<PageHeader
					title="Báo cáo thống kê"
					subtitle="Trang báo cáo tổng hợp"
					actions={
						<div className="flex flex-col align-bottom items-end gap-2">
							<TabNavigation
								tabs={[
									{ id: "month", label: "Theo tháng" },
									{ id: "year", label: "Theo năm" },
									{ id: "custom", label: "Tất cả" },
								]}
								activeTab={periodTab}
								onChange={(tab) => setPeriodTab(tab as any)}
							/>
							<ActionDropdown options={actions} />
						</div>
					}
				/>
				<div className="space-y-4">
					<div className="flex justify-end">
						{periodTab === "month" && (
							<MonthPicker
								value={monthValue}
								onChange={setMonthValue}
								yearRange={2}
							/>
						)}
						{periodTab === "year" && (
							<YearPicker
								value={Number(yearValue)}
								onChange={(year) => setYearValue(String(year))}
								yearRange={2}
							/>
						)}
						{periodTab === "custom" && (
							<div className="flex items-center gap-2">
								<span className="text-sm text-neutral-500">
									{dateRange.label}
								</span>
							</div>
						)}
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center h-[500px] ">
							<Spinner />
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<StatCard
									title="Doanh thu"
									value={totalRevenue.toLocaleString("vi-VN")}
									note={
										percentageComparedToPreviousMonth > 0
											? `${percentageComparedToPreviousMonth > 0 ? "+" : ""}${percentageComparedToPreviousMonth}% so với kỳ trước`
											: "VND"
									}
									accent="emerald"
								/>
								<StatCard
									title="Tổng công nợ"
									value={totalDebt.toLocaleString("vi-VN")}
									note={`${totalApartmentsOwing} căn hộ còn nợ`}
									accent="red"
								/>
								<StatCard
									title="Đã bảo trì"
									value={`${totalAssetsMaintenanced}`}
									note="thiết bị"
									accent="amber"
									clickable
									onClick={() => navigate("/maintenances")}
								/>
							</div>

							{/* Big chart */}
							<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
								<div className="mb-4 flex items-center justify-between gap-3">
									<h2 className="text-xl font-semibold">
										Doanh thu &amp; Chi phí
									</h2>
								</div>
								{hasDataRevenue ? (
									<RevenueExpenseChart
										revenue={revenuePoints}
										expense={expensePoints}
									/>
								) : (
									<div className="rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
										Không có dữ liệu trong khoảng <b>{dateRange.label}</b>. Hãy
										thử chọn tháng/năm khác.
									</div>
								)}
							</div>

							{/* Bottom cards */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
									<h3 className="mb-3 text-sm font-semibold">Dịch vụ (lượt)</h3>
									{hasDataRevenue ? (
										<ServicesBarChart data={servicePoints} />
									) : (
										<div className="text-sm text-neutral-600">
											Chưa có dữ liệu.
										</div>
									)}
								</div>

								<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
									<h3 className="mb-7 text-sm font-semibold">
										Tài sản &amp; Thiết bị
									</h3>
									{hasDataRevenue ? (
										<AssetStatusSummary
											data={{
												broken: assetStatus?.brokenAssets ?? 0,
												maintaining: assetStatus?.maintenancedAssets ?? 0,
												good: assetStatus?.workingAssets ?? 0,
											}}
										/>
									) : (
										<div className="text-sm text-neutral-600">
											Chưa có dữ liệu.
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default ReportPage;
