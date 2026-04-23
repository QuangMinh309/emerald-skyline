import { buildLinearScale, buildPoints, buildNiceTicks } from "@/lib/chart";

export type Point = { label: string; value: number };

type Props = {
	revenue: Point[];
	expense: Point[];
	width?: number;
	height?: number;
	yTicks?: number[];
	ariaLabel?: string;
};

export default function RevenueExpenseChart({
	revenue,
	expense,
	width = 1100,
	height = 280,
	ariaLabel = "Doanh thu và chi phí",
}: Props) {
	const padding = { l: 44, r: 18, t: 16, b: 42 };
	const innerW = width - padding.l - padding.r;
	const innerH = height - padding.t - padding.b;

	const n = Math.max(revenue.length, expense.length);

	// chart render rỗng thay vì crash)
	if (n === 0) {
		return (
			<div className="rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
				Không có dữ liệu để hiển thị.
			</div>
		);
	}

	const x = buildLinearScale(
		0,
		Math.max(n - 1, 1),
		padding.l,
		padding.l + innerW,
	);
	const all = [...revenue, ...expense].map((p) => p.value);
	const rawMax = Math.max(...all, 0);

	const maxWithPad = rawMax === 0 ? 1 : Math.ceil(rawMax * 1.1);

	const ticks = buildNiceTicks(0, maxWithPad, 5, { multipleOf: 5 });

	const yMax = ticks[ticks.length - 1] ?? maxWithPad;
	const y = buildLinearScale(0, yMax, padding.t + innerH, padding.t);

	const revPts = buildPoints(
		revenue.map((d) => d.value),
		x,
		y,
	);
	const expPts = buildPoints(
		expense.map((d) => d.value),
		x,
		y,
	);

	const revPath = toPath(revPts);
	const expPath = toPath(expPts);

	// X labels: ưu tiên label từ revenue, nếu thiếu thì lấy từ expense
	const labels = Array.from({ length: n }).map(
		(_, i) => revenue[i]?.label ?? expense[i]?.label ?? "",
	);

	return (
		<div className="w-full overflow-x-auto">
			<svg
				viewBox={`0 0 ${width} ${height + 30}`}
				className="h-[290px] w-full min-w-[720px]"
				role="img"
				aria-label={ariaLabel}
			>
				{/* Grid + Y axis labels */}
				{ticks.map((t) => {
					const yy = y(t);
					return (
						<g key={t}>
							<line
								x1={padding.l}
								y1={yy}
								x2={width - padding.r}
								y2={yy}
								className="stroke-neutral-200"
								strokeDasharray="4 4"
								strokeWidth="1"
							/>
							<text
								x={padding.l - 10}
								y={yy + 4}
								textAnchor="end"
								className="fill-neutral-500 text-[12px]"
							>
								{t === 0 ? "0" : `${t / 1000}k`}
							</text>
						</g>
					);
				})}

				{/* X labels */}
				{labels.map((lab, i) => (
					<text
						key={`${lab}-${i}`}
						x={x(i)}
						y={height - 16}
						textAnchor="middle"
						className="fill-neutral-500 text-[12px]"
					>
						{lab}
					</text>
				))}

				{/* Lines */}
				<path
					d={revPath}
					fill="none"
					className="stroke-emerald-900"
					strokeWidth="2"
				/>
				<path
					d={expPath}
					fill="none"
					className="stroke-orange-400"
					strokeWidth="2"
				/>

				{/* Points */}
				{revPts.map((p, idx) => (
					<circle
						key={`r-${idx}`}
						cx={p.x}
						cy={p.y}
						r="5"
						className="fill-white stroke-emerald-900"
						strokeWidth="2"
					/>
				))}
				{expPts.map((p, idx) => (
					<circle
						key={`e-${idx}`}
						cx={p.x}
						cy={p.y}
						r="5"
						className="fill-white stroke-orange-400"
						strokeWidth="2"
					/>
				))}

				{/* Legend */}
				<g transform={`translate(${width - 320}, ${height + 30})`}>
					<circle cx="8" cy="-6" r="4" className="fill-emerald-900" />
					<text x="18" y="-2" className="fill-neutral-600 text-[12px]">
						Doanh thu (triệu đồng)
					</text>

					<circle cx="170" cy="-6" r="4" className="fill-orange-400" />
					<text x="180" y="-2" className="fill-neutral-600 text-[12px]">
						Chi phí (triệu đồng)
					</text>
				</g>
			</svg>
		</div>
	);
}

function toPath(points: { x: number; y: number }[]) {
	if (points.length === 0) return "";
	return points.reduce(
		(acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
		"",
	);
}
