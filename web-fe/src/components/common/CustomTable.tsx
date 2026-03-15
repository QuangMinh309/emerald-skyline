import { useState, useMemo, useRef } from "react"; // Bỏ useEffect nếu không dùng
import {
	ChevronDown,
	ChevronUp,
	Edit,
	Trash2,
	Eye,
	ChevronsLeft,
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
	ImageIcon,
} from "lucide-react";
import type { TableColumn } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ColumnFilter } from "./ColumnFilter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";

interface CustomTableProps<T> {
	data: T[];
	columns: TableColumn<T>[];
	onSelectionChange?: (selectedIds: string[]) => void;
	selection?: (string | number)[];
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	onView?: (item: T) => void;
	isEditable?: (item: T) => boolean;
	defaultPageSize?: number;
	paginationAlign?: "start" | "center" | "end";
	showCheckbox?: boolean;
}

function CustomTable<T extends { id: string | number }>({
	data,
	columns,
	onSelectionChange,
	selection,
	onEdit,
	onDelete,
	onView,
	isEditable,
	defaultPageSize = 10,
	paginationAlign = "center",
	showCheckbox = true,
}: CustomTableProps<T>) {
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(defaultPageSize);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	} | null>(null);

	const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
		{},
	);
	const tableRef = useRef<HTMLDivElement>(null);

	// hàm cuộn lên khi chuyển trang
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);

		setTimeout(() => {
			const el = tableRef.current;
			if (el) {
				const rect = el.getBoundingClientRect();
				if (rect.top < 0) {
					el.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}
		}, 0);
	};

	// cập nhật checkbox từ props (khi cha reset)
	useEffect(() => {
		if (selection !== undefined) {
			setSelectedIds(selection);
		}
	}, [selection]);

	const handleFilterChange = (key: string, values: string[]) => {
		setActiveFilters((prev) => ({ ...prev, [key]: values }));
		setCurrentPage(1);
	};

	const processedData = useMemo(() => {
		let result = [...data];

		// filter
		Object.keys(activeFilters).forEach((filterKey) => {
			const filterValues = activeFilters[filterKey];
			if (filterValues.length > 0) {
				const column = columns.find((col) => String(col.key) === filterKey);
				result = result.filter((item) => {
					const itemValue = column?.filterAccessor
						? column.filterAccessor(item)
						: String((item as any)[filterKey]);
					return filterValues.includes(itemValue);
				});
			}
		});

		// sort
		if (sortConfig) {
			result.sort((a, b) => {
				const aValue = (a as any)[sortConfig.key];
				const bValue = (b as any)[sortConfig.key];
				if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
				if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
				return 0;
			});
		}
		return result;
	}, [data, sortConfig, activeFilters]);

	const totalItems = processedData.length;
	const totalPages = Math.ceil(totalItems / pageSize) || 1;
	const startIndex = (currentPage - 1) * pageSize;
	const currentData = processedData.slice(startIndex, startIndex + pageSize);

	const handleSort = (key: string) => {
		let direction: "asc" | "desc" = "asc";
		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	const handleCheckAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(processedData.map((d) => d.id));
			onSelectionChange?.(processedData.map((d) => d.id) as string[]);
		} else {
			setSelectedIds([]);
			onSelectionChange?.([]);
		}
	};

	const handleCheckRow = (id: string | number, checked: boolean) => {
		const newSelected = checked
			? [...selectedIds, id]
			: selectedIds.filter((i) => i !== id);
		setSelectedIds(newSelected);
		onSelectionChange?.(newSelected as string[]);
	};

	return (
		<div className="space-y-1.5">
			<div
				ref={tableRef}
				className="mt-8 rounded-sm border border-gray-300/50 bg-white shadow-sm overflow-hidden scroll-mt-24"
			>
				<Table>
					<TableHeader className="bg-third">
						<TableRow className="hover:bg-third border-b border-gray-300/50">
							{showCheckbox && (
								<TableHead className="w-12 border-r p-0 border-gray-300/50">
									<div className="flex items-center justify-center">
										<Checkbox
											checked={
												data.length > 0 && selectedIds.length === data.length
											}
											onCheckedChange={(c) => handleCheckAll(c as boolean)}
											className="data-[state=checked]:bg-main data-[state=checked]:border-main border-gray-400"
										/>
									</div>
								</TableHead>
							)}

							{columns.map((col) => (
								<TableHead
									key={String(col.key)}
									style={{ width: col.width }}
									className={cn(
										"text-gray-900 font-bold text-sm h-12 border-r border-gray-300/50 last:border-r-0 select-none",
									)}
								>
									<div className="relative flex items-center w-full h-full px-2">
										<div
											className={cn(
												"flex items-center gap-1 flex-1 transition-colors",
												col.sortable && "cursor-pointer hover:text-main",
												col.align === "center"
													? "justify-center"
													: col.align === "right"
														? "justify-end"
														: "justify-start",
											)}
											onClick={
												col.sortable
													? () => handleSort(String(col.key))
													: undefined
											}
										>
											{col.label}
											{col.sortable && (
												<div className="flex flex-col ml-0.5">
													<ChevronUp
														className={cn(
															"w-3 h-3 -mb-1",
															sortConfig?.key === col.key &&
																sortConfig.direction === "asc"
																? "text-main"
																: "text-gray-400",
														)}
													/>
													<ChevronDown
														className={cn(
															"w-3 h-3",
															sortConfig?.key === col.key &&
																sortConfig.direction === "desc"
																? "text-main"
																: "text-gray-400",
														)}
													/>
												</div>
											)}
										</div>

										{col.filterable && (
											<div
												className={cn(
													"ml-2",
													(col.align === "center" || col.align === "right") &&
														"absolute right-0 top-1/2 -translate-y-1/2",
												)}
												onClick={(e) => e.stopPropagation()}
											>
												<ColumnFilter
													columnKey={String(col.key)}
													title={col.label}
													data={data}
													onFilterChange={(vals) =>
														handleFilterChange(String(col.key), vals)
													}
													filterAccessor={col.filterAccessor}
												/>
											</div>
										)}
									</div>
								</TableHead>
							))}

							{(onEdit || onDelete || onView) && (
								<TableHead className="text-center pr-4 text-gray-900 font-bold w-[120px]">
									Thao tác
								</TableHead>
							)}
						</TableRow>
					</TableHeader>

					<TableBody>
						{currentData.length > 0 ? (
							currentData.map((row, index) => (
								<TableRow
									key={row.id}
									className="hover:bg-gray-50 border-b border-gray-300/50 last:border-0"
								>
									{showCheckbox && (
										<TableCell className="border-r border-gray-300/50 p-0 text-center align-middle w-12 min-w-12">
											<div className="flex items-center justify-center">
												<Checkbox
													checked={selectedIds.includes(row.id)}
													onCheckedChange={(c) =>
														handleCheckRow(row.id, c as boolean)
													}
													className="data-[state=checked]:bg-main data-[state=checked]:border-main border-gray-300"
												/>
											</div>
										</TableCell>
									)}

									{columns.map((col) => (
										<TableCell
											key={String(col.key)}
											className={cn(
												"py-4 text-gray-700 font-medium text-sm border-r border-gray-300/50 last:border-r-0",
												col.align === "center"
													? "text-center"
													: col.align === "right"
														? "text-right"
														: "text-left",
											)}
										>
											{col.isImage ? (
												<div
													className={cn(
														"flex",
														col.align === "center"
															? "justify-center"
															: col.align === "right"
																? "justify-end"
																: "justify-start",
													)}
												>
													<Avatar className="h-12 w-12 rounded-md border border-gray-200">
														<AvatarImage
															src={(row as any)[col.key]}
															alt="img"
															className="object-cover"
														/>
														<AvatarFallback className="rounded-md bg-gray-100">
															<ImageIcon className="w-5 h-5 text-gray-400" />
														</AvatarFallback>
													</Avatar>
												</div>
											) : col.key === "stt" ? (
												<span className="text-gray-500 font-semibold">
													{startIndex + index + 1}
												</span>
											) : col.render ? (
												col.render(row)
											) : (
												(row as any)[col.key]
											)}
										</TableCell>
									))}

									{(onEdit || onDelete || onView) && (
										<TableCell className="text-center py-4">
											<div className="flex items-center justify-center gap-1.2">
												{onEdit && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => onEdit(row)}
														className={cn(
															"h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50",
															isEditable && !isEditable(row) && "hidden",
														)}
														title="Sửa"
													>
														<Edit className="w-4 h-4 stroke-[2]" />
													</Button>
												)}
												{onDelete && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => onDelete(row)}
														className={cn(
															"h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50",
															isEditable && !isEditable(row) && "hidden",
														)}
														title="Xóa"
													>
														<Trash2 className="w-4 h-4 stroke-[2]" />
													</Button>
												)}
												{onView && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => onView(row)}
														className="h-8 w-8 text-gray-500 hover:text-main hover:bg-main/10"
														title="Xem"
													>
														<Eye className="w-4 h-4 stroke-[2]" />
													</Button>
												)}
											</div>
										</TableCell>
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={
										columns.length +
										(showCheckbox ? 1 : 0) +
										(onEdit || onDelete || onView ? 1 : 0)
									}
									className="h-32 text-center text-gray-500"
								>
									Không tìm thấy dữ liệu phù hợp
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{data.length > 0 && (
				<div
					className={cn(
						"flex flex-col md:flex-row items-center gap-4 py-2",
						paginationAlign === "center" && "justify-center relative",
					)}
				>
					<div
						className={cn(
							"text-sm text-gray-500 font-medium",
							paginationAlign === "center" && "md:absolute md:left-0",
						)}
					>
						Hiển thị {startIndex + 1}-
						{Math.min(startIndex + pageSize, totalItems)} / {totalItems}
					</div>

					<div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => handlePageChange(1)}
							disabled={currentPage === 1}
						>
							<ChevronsLeft className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<span className="text-sm font-bold text-main min-w-[3rem] text-center">
							{currentPage} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() =>
								handlePageChange(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => handlePageChange(totalPages)}
							disabled={currentPage === totalPages}
						>
							<ChevronsRight className="w-4 h-4" />
						</Button>
					</div>

					<div
						className={cn(
							"flex items-center gap-3",
							paginationAlign === "center" && "md:absolute md:right-0",
						)}
					>
						<span className="text-sm font-medium text-gray-600">Hiển thị</span>
						<Select
							value={`${pageSize}`}
							onValueChange={(v) => {
								setPageSize(Number(v));
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="h-9 w-[110px] bg-white border-gray-300 rounded-md text-sm shadow-sm focus:ring-1 focus:ring-main focus:border-main">
								<SelectValue placeholder={`${pageSize} dòng`} />
							</SelectTrigger>

							<SelectContent side="top" className="min-w-[110px]">
								{[10, 20, 35, 50].map((s) => (
									<SelectItem
										key={s}
										value={`${s}`}
										className="cursor-pointer text-sm focus:bg-main/10 focus:text-main"
									>
										{s} dòng
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}
		</div>
	);
}

export default CustomTable;
