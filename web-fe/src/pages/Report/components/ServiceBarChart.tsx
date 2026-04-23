import { buildLinearScale, buildNiceTicks } from "@/lib/chart";
import { useRef, useState } from "react";

export type BarPoint = { label: string; value: number };

type Props = {
	data: BarPoint[];
	width?: number;
	height?: number;
	ariaLabel?: string;
	maxFallback?: number;
};
const MAX_BAR_W = 90;
const MIN_GAP = 18;
const MAX_LABEL_CHARS = 14;

const truncate = (s: string, max = MAX_LABEL_CHARS) =>
	s.length > max ? s.slice(0, max - 1) + "…" : s;

export default function ServicesBarChart({
	data,
	width = 520,
	height = 240,
	ariaLabel = "Dịch vụ",
}: Props) {
	const padding = { l: 44, r: 18, t: 10, b: 44 };
	const innerH = height - padding.t - padding.b;

	if (!data || data.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
				Không có dữ liệu để hiển thị.
			</div>
		);
	}
	const n = data.length;

	// vùng vẽ thật sự theo trục X
	const left = padding.l + 10;
	const right = width - padding.r;
	const plotW = right - left;

	let barW = Math.min(MAX_BAR_W, plotW / n); // bar width theo số cột (có cap)
	let gap = n > 1 ? (plotW - n * barW) / (n - 1) : 0;

	// nếu gap nhỏ hơn MIN_GAP, giảm barW để giữ gap tối thiểu
	if (n > 1 && gap < MIN_GAP) {
		gap = MIN_GAP;
		barW = (plotW - (n - 1) * gap) / n;
		// nếu vẫn vượt MAX_BAR_W thì cap lại
		barW = Math.min(barW, MAX_BAR_W);
	}

	// startX chính là mép trái vùng plot (space-between đúng nghĩa)
	// const startX = left;

	// const totalGap = n > 1 ? (n - 1) * MIN_GAP : 0;
	// const barW = Math.min(MAX_BAR_W, (innerW - totalGap) / n);

	const startX = padding.l + 10;
	const rawMax = Math.max(...data.map((d) => Math.round(d.value)), 0);
	const baseMax = rawMax === 0 ? 10 : rawMax;

	const maxWithPad = Math.ceil(baseMax * 1.1);

	const ticks = buildNiceTicks(0, maxWithPad, 5, { minStep: 1, multipleOf: 5 });
	const yMax = ticks[ticks.length - 1] ?? maxWithPad;

	const y = buildLinearScale(0, yMax, padding.t + innerH, padding.t);

	const wrapRef = useRef<HTMLDivElement | null>(null);
	const [tooltip, setTooltip] = useState<{
		show: boolean;
		x: number;
		y: number;
		text: string;
	}>({ show: false, x: 0, y: 0, text: "" });

	const showTip = (e: React.MouseEvent, text: string) => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const r = wrap.getBoundingClientRect();

		// vị trí tooltip theo chuột, tính theo div wrapper
		const x = e.clientX - r.left + 10;
		const y = e.clientY - r.top - 10;

		setTooltip({ show: true, x, y, text });
	};

	const moveTip = (e: React.MouseEvent) => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const r = wrap.getBoundingClientRect();
		const x = e.clientX - r.left + 10;
		const y = e.clientY - r.top - 10;

		setTooltip((prev) => ({ ...prev, x, y }));
	};

	const hideTip = () => setTooltip((prev) => ({ ...prev, show: false }));

	return (
		<div ref={wrapRef} className="relative w-full overflow-x-auto">
			{/* Tooltip overlay */}
			{tooltip.show && (
				<div
					className="pointer-events-none absolute z-10 max-w-[280px] whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 shadow"
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
					}}
				>
					{tooltip.text}
				</div>
			)}

			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="h-[240px] w-full min-w-[420px]"
				role="img"
				aria-label={ariaLabel}
				onMouseLeave={hideTip}
			>
				{/* Grid + y labels */}
				{ticks.map((t) => {
					const yy = y(t);
					return (
						<g key={t}>
							<line
								x1={padding.l}
								y1={yy}
								x2={width - padding.r}
								y2={yy}
								className="stroke-indigo-200"
								strokeDasharray="4 4"
								strokeWidth="1"
							/>
							<text
								x={padding.l - 10}
								y={yy + 4}
								textAnchor="end"
								className="fill-neutral-500 text-[12px]"
							>
								{t}
							</text>
						</g>
					);
				})}

				{/* Bars */}
				{data.map((d, i) => {
					const x = startX + i * (barW + gap);
					const h = y(0) - y(d.value);
					const yy = y(d.value);

					return (
						<g key={`${d.label}-${i}`}>
							{/* Rect bắt hover (dễ trúng nhất) */}
							<rect
								x={x}
								y={yy}
								width={barW}
								height={h}
								rx="10"
								className="fill-neutral-200"
								style={{ cursor: "default" }}
								onMouseEnter={(e) => showTip(e, d.label)}
								onMouseMove={moveTip}
								onMouseLeave={hideTip}
							/>

							{/* Label (truncate) */}
							<text
								x={x + barW / 2}
								y={height - 16}
								textAnchor="middle"
								className="fill-neutral-600 text-[12px]"
								style={{ pointerEvents: "none" }}
							>
								{truncate(d.label)}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
