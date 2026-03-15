import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface ColumnFilterProps<T> {
	columnKey: string;
	title: string;
	data: T[];
	onFilterChange: (values: string[]) => void;
	filterAccessor?: (item: T) => string;
}

export function ColumnFilter<T>({
	columnKey,
	title,
	data,
	onFilterChange,
	filterAccessor,
}: ColumnFilterProps<T>) {
	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	const options = Array.from(
		new Set(
			data
				.map((item) => {
					if (filterAccessor) return filterAccessor(item);
					return String((item as any)[columnKey] || "");
				})
				.filter(Boolean),
		),
	).sort();

	const toggleOption = (value: string) => {
		const newValues = selectedValues.includes(value)
			? selectedValues.filter((v) => v !== value)
			: [...selectedValues, value];

		setSelectedValues(newValues);
		onFilterChange(newValues);
	};

	const clearFilter = () => {
		setSelectedValues([]);
		onFilterChange([]);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={`h-8 w-8 p-0 hover:bg-main/10 ${
						selectedValues.length > 0 ? "text-main" : "text-gray-400"
					}`}
				>
					<Filter className="h-3 w-3" />
					{selectedValues.length > 0 && (
						<span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-main" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<div className="p-2 font-semibold text-sm border-b bg-gray-50">
					Lọc {title.toLowerCase()}
				</div>

				<div className="p-1 max-h-[200px] overflow-y-auto">
					{options.length > 0 ? (
						options.map((option) => (
							<div
								key={option}
								className="flex items-center space-x-2 px-2 py-2.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
								onClick={() => toggleOption(option)}
							>
								<Checkbox
									checked={selectedValues.includes(option)}
									className="data-[state=checked]:bg-main data-[state=checked]:border-main"
								/>
								<span className="text-sm truncate leading-normal">
									{option}
								</span>
							</div>
						))
					) : (
						<div className="p-4 text-xs text-gray-500 text-center">
							Không có dữ liệu lọc
						</div>
					)}
				</div>

				{selectedValues.length > 0 && (
					<>
						<Separator />
						<div className="p-1">
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-xs h-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
								onClick={clearFilter}
							>
								Xóa lọc
							</Button>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
