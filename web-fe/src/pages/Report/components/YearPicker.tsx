import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type YearPickerProps = {
	value: number;
	onChange: (year: number) => void;
	yearRange?: number;
	className?: string;
};

export function YearPicker({
	value,
	onChange,
	yearRange = 6,
	className,
}: YearPickerProps) {
	const currentYear = new Date().getFullYear();
	const years = React.useMemo(
		() => Array.from({ length: yearRange }).map((_, i) => currentYear - i),
		[yearRange, currentYear],
	);

	return (
		<Select
			value={String(value || currentYear)}
			onValueChange={(v) => onChange(Number(v))}
		>
			<SelectTrigger
				className={cn(
					"h-9 w-[140px] bg-white border-neutral-200 rounded-lg text-sm shadow-sm " +
						"focus:ring-1 focus:ring-main focus:border-main",
					className,
				)}
			>
				<div className="flex items-center gap-2">
					<CalendarIcon className="h-4 w-4 opacity-50" />
					<SelectValue placeholder="Năm" />
				</div>
			</SelectTrigger>

			<SelectContent
				side="bottom"
				align="start"
				sideOffset={6}
				avoidCollisions
				className="z-50 max-h-72"
			>
				<div className="px-2 py-2 border-b text-xs font-semibold text-neutral-600">
					Chọn năm
				</div>
				{years.map((yy) => (
					<SelectItem key={yy} value={String(yy)} className="cursor-pointer">
						<div className="flex items-center justify-between w-full">
							<span>{yy}</span>
							{yy === value}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
