type AssetStatusData = {
	broken: number;
	maintaining: number;
	good: number;
};

type Props = {
	data: AssetStatusData;
	loading?: boolean;
	emptyText?: string;
};

const STATUS_META = {
	broken: { label: "Hư hỏng", bar: "bg-rose-400", dot: "bg-rose-400" },
	maintaining: {
		label: "Đang bảo trì",
		bar: "bg-yellow-300",
		dot: "bg-yellow-400",
	},
	good: {
		label: "Hoạt động tốt",
		bar: "bg-emerald-300",
		dot: "bg-emerald-400",
	},
} as const;

export default function AssetStatusSummary({
	data,
	loading = false,
	emptyText = "Chưa có dữ liệu.",
}: Props) {
	const broken = safeNum(data?.broken);
	const maintaining = safeNum(data?.maintaining);
	const good = safeNum(data?.good);

	const total = broken + maintaining + good;

	if (loading) {
		return (
			<div className="rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
				Đang tải dữ liệu...
			</div>
		);
	}

	if (total === 0) {
		return (
			<div className="rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
				{emptyText}
			</div>
		);
	}

	const brokenPct = (broken / total) * 100;
	const maintainingPct = (maintaining / total) * 100;
	const goodPct = (good / total) * 100;

	return (
		<div className="space-y-5">
			{/* segmented bar */}
			<div className="flex h-10 w-full overflow-hidden rounded-2xl bg-neutral-100">
				<div
					className={STATUS_META.broken.bar}
					style={{ width: `${brokenPct}%` }}
				/>
				<div
					className={STATUS_META.maintaining.bar}
					style={{ width: `${maintainingPct}%` }}
				/>
				<div
					className={STATUS_META.good.bar}
					style={{ width: `${goodPct}%` }}
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<Metric
					label={STATUS_META.broken.label}
					value={broken}
					dotClass={STATUS_META.broken.dot}
				/>
				<Metric
					label={STATUS_META.maintaining.label}
					value={maintaining}
					dotClass={STATUS_META.maintaining.dot}
				/>
				<Metric
					label={STATUS_META.good.label}
					value={good}
					dotClass={STATUS_META.good.dot}
				/>
			</div>

			<div className="text-xs text-neutral-500">
				Tổng: {total.toLocaleString("vi-VN")}
			</div>
		</div>
	);
}

function Metric({
	label,
	value,
	dotClass,
}: {
	label: string;
	value: number;
	dotClass: string;
}) {
	return (
		<div className="space-y-1">
			<div className="text-sm text-neutral-500">{label}</div>
			<div className="flex items-center gap-2 text-xl font-semibold">
				<span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
				<span>{value.toLocaleString("vi-VN")}</span>
			</div>
		</div>
	);
}

function safeNum(v: unknown) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) && n > 0 ? n : 0;
}
