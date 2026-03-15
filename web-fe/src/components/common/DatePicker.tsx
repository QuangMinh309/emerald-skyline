import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Cấu hình format cho từng loại
const typeConfig = {
	date: {
		format: "dd/MM/yyyy", // Đã sửa thành format Việt Nam
		mode: "single" as const,
	},
	month: {
		format: "MM/yyyy",
		mode: "single" as const,
	},
	year: {
		format: "yyyy",
		mode: "single" as const,
	},
};

interface DatePickerProps {
	value?: Date | string;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
	type?: "date" | "month" | "year";
	minDate?: Date; // Thêm sẵn để hỗ trợ disable ngày cũ
	maxDate?: Date;
}

export function DatePicker({
	value,
	onChange,
	placeholder,
	className,
	type = "date",
	minDate,
	maxDate,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	// Xử lý value an toàn
	const dateValue = value ? new Date(value) : undefined;
	const config = typeConfig[type];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full h-9 flex items-center justify-start gap-2 font-normal",
						!dateValue && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="h-4 w-4 opacity-50" />
					{dateValue ? (
						format(dateValue, config.format)
					) : (
						<span>{placeholder || config.format}</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode={config.mode}
					selected={dateValue}
					onSelect={(date) => {
						onChange(date);
						setOpen(false);
					}}
					// Hỗ trợ disable ngày (ví dụ minDate cho ngày đăng thông báo)
					disabled={(date) => {
						if (minDate && date < minDate) return true;
						if (maxDate && date > maxDate) return true;
						return false;
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
