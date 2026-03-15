import { FileText, X, FileUp } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface UploadFilesProps {
	files: File[];
	onChange: (files: File[]) => void;
	label?: string;
	maxFiles?: number;
}

export const UploadFiles = ({
	files,
	onChange,
	label = "Tài liệu đính kèm (nếu có)",
	maxFiles = 10,
}: UploadFilesProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;

		const selectedFiles = Array.from(e.target.files);
		const availableSlots = maxFiles - files.length;

		if (availableSlots <= 0) {
			toast.warning(`Đã đạt giới hạn tối đa ${maxFiles} tài liệu`);
			e.target.value = "";
			return;
		}

		if (selectedFiles.length > availableSlots) {
			toast.warning(
				`Chỉ có thể thêm ${availableSlots} tài liệu nữa. Các file thừa đã bị loại bỏ.`,
			);

			const validFiles = selectedFiles.slice(0, availableSlots);
			onChange([...files, ...validFiles]);
		} else {
			onChange([...files, ...selectedFiles]);
		}

		e.target.value = "";
	};

	const isFull = files.length >= maxFiles;

	return (
		<div className="space-y-3 w-full">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-meidum leading-none">
					{label}{" "}
					<span className="text-muted-foreground font-normal ml-1">
						({files.length}/{maxFiles})
					</span>
				</Label>
			</div>

			<div className="space-y-2">
				{files.map((file, idx) => (
					<div
						key={idx}
						className="group flex items-center p-3 bg-background border rounded-lg text-sm shadow-sm hover:border-main/50 transition-colors w-full"
					>
						<FileText size={18} className="text-secondary shrink-0 mr-3" />

						<div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-2 items-center">
							<span
								className="truncate font-medium text-main block"
								title={file.name}
							>
								{file.name}
							</span>
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								({(file.size / 1024).toFixed(0)} KB)
							</span>
						</div>

						<button
							type="button"
							onClick={() => onChange(files.filter((_, i) => i !== idx))}
							className="ml-3 text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-full hover:bg-muted shrink-0"
						>
							<X size={16} />
						</button>
					</div>
				))}
			</div>

			{!isFull && (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-sm font-medium text-muted-foreground hover:border-main hover:text-main hover:bg-main/5 transition-all duration-200 group"
				>
					<div className="p-2 bg-muted group-hover:bg-white rounded-full transition-colors">
						<FileUp
							size={18}
							className="text-muted-foreground group-hover:text-main"
						/>
					</div>
					<span>Bấm để tải tài liệu lên</span>
				</button>
			)}

			{isFull && (
				<div className="w-full py-3 text-center text-xs text-muted-foreground bg-muted/30 rounded border border-dashed">
					Đã đạt giới hạn số lượng file
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.doc,.docx,.xls,.xlsx"
				multiple
				className="hidden"
				onChange={onSelect}
				disabled={isFull}
			/>
		</div>
	);
};
