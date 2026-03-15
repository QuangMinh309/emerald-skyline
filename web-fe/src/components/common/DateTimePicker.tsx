import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, isSameDay, startOfDay, isBefore, set } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DateTimePickerProps {
	value?: Date | string;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
	minDate?: Date;
}

export function DateTimePicker({
	value,
	onChange,
	placeholder = "dd/MM/yyyy HH:mm",
	className,
	minDate,
}: DateTimePickerProps) {
	const [open, setOpen] = React.useState(false);
	const dateValue = value ? new Date(value) : undefined;

	// set giây và mili giây về 0 để so sánh
	const safeMinDate = React.useMemo(() => {
		if (!minDate) return undefined;
		return set(minDate, { seconds: 0, milliseconds: 0 });
	}, [minDate]);

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (!selectedDate) {
			onChange(undefined);
			return;
		}

		let newDate = new Date(selectedDate);
		newDate = set(newDate, { seconds: 0, milliseconds: 0 });

		if (dateValue) {
			newDate = set(newDate, {
				hours: dateValue.getHours(),
				minutes: dateValue.getMinutes(),
			});
		} else {
			newDate = set(newDate, { hours: 0, minutes: 0 });

			if (safeMinDate && isSameDay(newDate, safeMinDate)) {
				newDate = set(newDate, {
					hours: safeMinDate.getHours(),
					minutes: safeMinDate.getMinutes(),
				});
			}
		}

		if (safeMinDate && isBefore(newDate, safeMinDate)) {
			onChange(safeMinDate);
		} else {
			onChange(newDate);
		}
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const timeString = e.target.value;
		if (!timeString) return;

		const [hours, minutes] = timeString.split(":").map(Number);
		const baseDate = dateValue || new Date();

		const newDate = set(baseDate, {
			hours,
			minutes,
			seconds: 0,
			milliseconds: 0,
		});

		if (safeMinDate && isBefore(newDate, safeMinDate)) {
			toast.error(
				`Thời gian phải từ ${format(safeMinDate, "HH:mm dd/MM")} trở đi`,
			);
			return;
		}

		onChange(newDate);
	};

	const isTimeRestricted =
		dateValue && safeMinDate && isSameDay(dateValue, safeMinDate);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-between font-normal text-left h-9 px-3",
						!dateValue && "text-muted-foreground",
						className,
					)}
				>
					<div className="flex items-center">
						<CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
						{dateValue ? (
							format(dateValue, "dd/MM/yyyy HH:mm")
						) : (
							<span>{placeholder}</span>
						)}
					</div>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					selected={dateValue}
					onSelect={handleDateSelect}
					disabled={(date) =>
						safeMinDate ? isBefore(date, startOfDay(safeMinDate)) : false
					}
				/>

				<div className="p-3 border-t border-border">
					<Label className="text-xs font-semibold mb-2 block">
						Thời gian{" "}
						{isTimeRestricted &&
							"(Tối thiểu " + format(safeMinDate, "HH:mm") + ")"}
					</Label>
					<div className="flex items-center gap-2">
						<Input
							type="time"
							className="h-8"
							value={dateValue ? format(dateValue, "HH:mm") : ""}
							onChange={handleTimeChange}
							min={isTimeRestricted ? format(safeMinDate, "HH:mm") : undefined}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
