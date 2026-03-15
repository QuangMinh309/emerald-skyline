import { cn } from "@/lib/utils";

export type Accent =
	| "emerald"
	| "red"
	| "amber"
	| "blue"
	| "purple"
	| "orange"
	| "green";

const accentMap: Record<Accent, string> = {
	emerald: "border-l-4 border-l-emerald-600",
	green: "border-l-4 border-l-green-600",
	red: "border-l-4 border-l-red-600",
	amber: "border-l-4 border-l-amber-500",
	blue: "border-l-4 border-l-blue-600",
	purple: "border-l-4 border-l-purple-600",
	orange: "border-l-4 border-l-orange-500",
};

const valueMap: Record<Accent, string> = {
	emerald: "text-emerald-600",
	green: "text-green-600",
	red: "text-red-600",
	amber: "text-amber-500",
	blue: "text-blue-600",
	purple: "text-purple-600",
	orange: "text-orange-600",
};

interface StatCardProps {
	title: string;
	value: string;
	note?: string;
	accent: Accent;
	icon?: React.ReactNode;
	clickable?: boolean;
	onClick?: () => void;
	className?: string;
}

export default function StatCard(props: StatCardProps) {
	const { title, value, note, accent, clickable, icon, className, onClick } =
		props;
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!clickable) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5",
				"shadow-md hover:shadow-lg transition-all duration-300",
				"flex flex-col h-full",
				accentMap[accent],
				clickable && "cursor-pointer hover:-translate-y-1",
				className,
			)}
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={clickable ? onClick : undefined}
			onKeyDown={handleKeyDown}
		>
			<div className="flex justify-between items-start mb-2">
				<div className="text-base font-semibold tracking-wide">{title}</div>
				{icon && <div className="opacity-80">{icon}</div>}
			</div>

			<div className="flex-1 flex items-center justify-start">
				<div className={cn("text-xl font-bold", valueMap[accent])}>{value}</div>
			</div>

			{note && (
				<div className="mt-auto pt-2">
					<p className="text-sm text-gray-600 font-medium">{note}</p>
				</div>
			)}
		</div>
	);
}
