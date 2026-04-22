import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";
import type { VotingData, VotingStatistic } from "@/types/voting";

interface PrintableVotingResultProps {
	voting: VotingData;
	stats: VotingStatistic | null;
}

const COLOR_PALETTE = [
	"#5470C6",
	"#91CC75",
	"#FAC858",
	"#EE6666",
	"#73C0DE",
	"#3BA272",
	"#FC8452",
];

// custom label cho biểu đồ
// tính toán vị trí để vẽ đường kẻ và số % nằm bên ngoài biểu đồ
const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	outerRadius,
	percent,
	index,
}: any) => {
	const RADIAN = Math.PI / 180;

	// tính toán điểm gãy khúc của đường kẻ
	const sin = Math.sin(-RADIAN * midAngle);
	const cos = Math.cos(-RADIAN * midAngle);
	const sx = cx + (outerRadius + 5) * cos;
	const sy = cy + (outerRadius + 5) * sin;
	const mx = cx + (outerRadius + 20) * cos;
	const my = cy + (outerRadius + 20) * sin;
	const ex = mx + (cos >= 0 ? 1 : -1) * 15;
	const ey = my;
	const textAnchor = cos >= 0 ? "start" : "end";

	return (
		<g>
			<path
				d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
				stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
				fill="none"
			/>
			{/* vòng tròn nhỏ ở đầu đường kẻ */}
			<circle
				cx={ex}
				cy={ey}
				r={2}
				fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
				stroke="none"
			/>
			{/* số phần trăm */}
			<text
				x={ex + (cos >= 0 ? 1 : -1) * 12}
				y={ey}
				textAnchor={textAnchor}
				fill="#333"
				dominantBaseline="central"
				fontSize={14}
				fontWeight="bold"
			>
				{`${(percent * 100).toFixed(1)}%`}
			</text>
		</g>
	);
};

export const PrintableVotingResult = ({
	voting,
	stats,
}: PrintableVotingResultProps) => {
	const mainColor = "#244B35";
	const currentDate = new Date();

	const formatArea = (area: number | undefined | null) => {
		if (area === undefined || area === null) return "0";
		return new Intl.NumberFormat("vi-VN").format(area);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "---";
		return format(new Date(dateString), "dd/MM/yyyy HH:mm");
	};

	const chartData = useMemo(() => {
		if (!stats?.results) return [];
		return stats.results.map((item, index) => ({
			name: item.optionName,
			value: item.totalArea,
			fill: COLOR_PALETTE[index % COLOR_PALETTE.length],
		}));
	}, [stats]);

	if (!stats) return null;

	return (
		<div
			className="hidden print:block p-10 bg-white text-black leading-relaxed"
			style={{ fontFamily: '"Times New Roman", Times, serif' }}
		>
			<div className="flex flex-col items-center mb-6">
				<h1
					className="text-2xl font-bold uppercase mb-2 text-center tracking-wide"
					style={{ color: mainColor }}
				>
					Báo Cáo Kết Quả Biểu Quyết
				</h1>
				<h2 className="text-xl font-bold mb-2 text-center text-gray-900">
					{voting.title}
				</h2>
				<p className="text-base italic text-gray-600">
					Ngày in: {format(currentDate, "dd/MM/yyyy HH:mm")}
				</p>
			</div>

			<div className="mb-10">
				<h3 className="text-lg font-bold mb-4" style={{ color: mainColor }}>
					I. Thông tin chung
				</h3>

				<table className="w-full text-base">
					<tbody>
						{/* dòng 1 */}
						<tr>
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Thời gian bắt đầu:
							</td>
							<td className="py-2.5 pr-8">{formatDate(voting.startTime)}</td>
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Thời gian kết thúc:
							</td>
							<td className="py-2.5">{formatDate(voting.endTime)}</td>
						</tr>

						{/* dòng 2 */}
						<tr className="bg-gray-50">
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Tổng diện tích:
							</td>
							<td className="py-2.5 pr-8">
								{formatArea(stats.totalEligibleArea)} m²{" "}
								<span className="text-sm text-gray-500">(Đủ điều kiện)</span>
							</td>
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Diện tích tham gia:
							</td>
							<td className="py-2.5">
								{formatArea(stats.votedArea)} m²{" "}
								<span className="text-sm italic text-gray-600">
									(Đạt tỷ lệ: {stats.participationRate.toFixed(2)}%)
								</span>
							</td>
						</tr>

						{/* dòng 3 */}
						<tr>
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Đối tượng:
							</td>
							<td className="py-2.5 pr-8">
								{voting.targetScope === "ALL"
									? "Toàn chung cư"
									: voting.targetScope === "BLOCK"
										? "Theo tòa nhà"
										: "Theo tầng"}
							</td>
							<td className="py-2.5 pr-4 font-semibold text-gray-700 whitespace-nowrap">
								Tỷ lệ cử tri:
							</td>
							<td className="py-2.5">{voting.votingRatio || "---"}</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div className="mb-10 break-inside-avoid">
				<h3 className="text-lg font-bold mb-4" style={{ color: mainColor }}>
					II. Biểu đồ tỷ lệ (theo diện tích)
				</h3>
				<div className="flex justify-center items-center border border-gray-300 rounded-sm p-6">
					<PieChart width={700} height={350}>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							outerRadius={100}
							label={renderCustomizedLabel}
							labelLine={false}
							dataKey="value"
							isAnimationActive={false}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.fill}
									stroke="white"
									strokeWidth={2}
								/>
							))}
						</Pie>
						<Legend
							layout="vertical"
							verticalAlign="middle"
							align="right"
							wrapperStyle={{
								fontSize: "14px",
								fontFamily: "Times New Roman",
								paddingLeft: "20px",
							}}
						/>
					</PieChart>
				</div>
			</div>

			<div className="mb-12">
				<h3 className="text-lg font-bold mb-4" style={{ color: mainColor }}>
					III. Chi tiết kết quả
				</h3>
				<table className="w-full border-collapse border border-black text-sm">
					<thead>
						<tr className="bg-gray-200 print:bg-gray-200 font-bold text-center">
							<th className="border border-black p-3 w-16">STT</th>
							<th className="border border-black p-3 text-left">
								Phương án biểu quyết
							</th>
							<th className="border border-black p-3 w-48">
								Diện tích tán thành (m²)
							</th>
							<th className="border border-black p-3 w-32">Tỷ lệ (%)</th>
						</tr>
					</thead>
					<tbody>
						{stats.results.map((item, index) => (
							<tr key={item.optionId} className="text-center text-base">
								<td className="border border-black p-2">{index + 1}</td>
								<td className="border border-black p-2 text-left font-medium">
									{item.optionName}
								</td>
								<td className="border border-black p-2 font-medium">
									{formatArea(item.totalArea)}
								</td>
								<td className="border border-black p-2 font-bold">
									{item.percentage.toFixed(2)}%
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-between mt-12 px-8 break-inside-avoid">
				<div className="text-center">
					<p className="font-bold mb-16">Người lập báo cáo</p>
					<p className="italic text-sm">(Ký, họ tên)</p>
				</div>
				<div className="text-center">
					<p className="font-bold mb-16">Ban quản trị</p>
					<p className="italic text-sm">(Ký, họ tên, đóng dấu)</p>
				</div>
			</div>
		</div>
	);
};
