import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronsLeft,
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
} from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	pageSizeOptions?: number[];
	align?: "start" | "center" | "end";
}

export const Pagination = ({
	currentPage,
	totalPages,
	pageSize,
	totalItems,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
	align = "center",
}: PaginationProps) => {
	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	const alignmentClasses = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
	};

	return (
		<div className={`flex items-center ${alignmentClasses[align]} gap-6 py-4`}>
			{/* Page size selector */}
			{onPageSizeChange && (
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">Hiển thị</span>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="w-[70px] h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="text-sm text-gray-600">dòng</span>
				</div>
			)}

			{/* Page info */}
			<div className="text-sm text-gray-600">
				Hiển thị <span className="font-medium">{startItem}</span> -{" "}
				<span className="font-medium">{endItem}</span> trong tổng số{" "}
				<span className="font-medium">{totalItems}</span>
			</div>

			{/* Page controls */}
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<div className="flex items-center gap-1 px-2">
					<span className="text-sm text-gray-600">
						Trang <span className="font-medium">{currentPage}</span> /{" "}
						<span className="font-medium">{totalPages}</span>
					</span>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
