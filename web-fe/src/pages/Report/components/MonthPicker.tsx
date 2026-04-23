import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type MonthPickerProps = {
	value: string; // "YYYY-MM"
	onChange: (value: string) => void;
	yearRange?: number;
	className?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export function MonthPicker({
	value,
	onChange,
	yearRange = 6,
	className,
}: MonthPickerProps) {
	const [yStr, mStr] = value.split("-");
	const year = Number(yStr) || new Date().getFullYear();
	const month = Number(mStr) || new Date().getMonth() + 1;

	const years = Array.from({ length: yearRange }).map(
		(_, i) => new Date().getFullYear() - i,
	);

	return (
		<div className={cn("flex gap-2", className)}>
			{/* Tháng */}
			<Select
				value={String(month)}
				onValueChange={(v) => {
					const mm = pad2(Number(v));
					onChange(`${year}-${mm}`);
				}}
			>
				<SelectTrigger className="h-9 w-[140px] bg-white border-neutral-200 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-main focus:border-main">
					<SelectValue placeholder="Tháng" />
				</SelectTrigger>

				<SelectContent
					side="bottom"
					align="start"
					sideOffset={6}
					avoidCollisions
					className="z-50 max-h-72"
				>
					{Array.from({ length: 12 }).map((_, i) => {
						const mm = i + 1;
						return (
							<SelectItem
								key={mm}
								value={String(mm)}
								className="cursor-pointer"
							>
								Tháng {mm}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			{/* Năm */}
			<Select
				value={String(year)}
				onValueChange={(v) => {
					onChange(`${v}-${pad2(month)}`);
				}}
			>
				<SelectTrigger className="h-9 w-[120px] bg-white border-neutral-200 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-main focus:border-main">
					<SelectValue placeholder="Năm" />
				</SelectTrigger>

				<SelectContent
					side="bottom"
					align="start"
					sideOffset={6}
					avoidCollisions
					className="z-50 max-h-72"
				>
					{years.map((yy) => (
						<SelectItem key={yy} value={String(yy)} className="cursor-pointer">
							{yy}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
