import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { RequiredLabel } from "@/components/common/RequiredLabel";

interface UploadImagesProps {
	files: File[];
	onChange: (files: File[]) => void;
	isRequired?: boolean;
	maxImages?: number;
	existingUrls?: string[];
	onRemoveExisting?: (index: number) => void;
}

// giá trị mặc định nếu không truyền
const DEFAULT_MAX_IMAGES = 5;

export const UploadImages = ({
	files,
	onChange,
	isRequired,
	maxImages = DEFAULT_MAX_IMAGES,
	existingUrls = [],
	onRemoveExisting,
}: UploadImagesProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const totalImages = files.length + existingUrls.length;

	const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;

		const selected = Array.from(e.target.files);
		const remain = maxImages - totalImages;

		if (remain <= 0) {
			toast.warning(`Chỉ được tải tối đa ${maxImages} hình ảnh`);
			return;
		}

		if (selected.length > remain) {
			toast.warning(`Bạn chỉ có thể thêm tối đa ${remain} hình ảnh nữa`);
		}

		onChange([...files, ...selected.slice(0, remain)]);
		e.target.value = "";
	};

	return (
		<div className="space-y-2.5">
			<div className="flex items-center justify-between">
				<RequiredLabel isRequired={isRequired}>
					Hình ảnh đính kèm{" "}
					<span className="text-gray-500 font-normal text-xs ml-1">
						({totalImages}/{maxImages})
					</span>
				</RequiredLabel>
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
				{existingUrls.map((url, idx) => (
					<div
						key={`existing-${idx}`}
						className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden group hover:shadow-sm transition-shadow"
					>
						<img
							src={url}
							alt="existing"
							className="w-full h-full object-cover"
						/>
						{onRemoveExisting && (
							<button
								type="button"
								onClick={() => onRemoveExisting(idx)}
								className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
							>
								<X size={14} />
							</button>
						)}
					</div>
				))}

				{files.map((file, idx) => (
					<div
						key={idx}
						className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden group hover:shadow-sm transition-shadow"
					>
						<img
							src={URL.createObjectURL(file)}
							alt="preview"
							className="w-full h-full object-cover"
						/>
						<button
							type="button"
							onClick={() => onChange(files.filter((_, i) => i !== idx))}
							className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
						>
							<X size={14} />
						</button>
					</div>
				))}

				<button
					type="button"
					disabled={totalImages >= maxImages}
					onClick={() => inputRef.current?.click()}
					className={`
            aspect-square flex flex-col items-center justify-center
            rounded-lg border-2 border-dashed transition-all duration-200
            ${
							totalImages >= maxImages
								? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
								: "border-gray-300 text-gray-600 hover:border-main hover:text-main hover:bg-main/5"
						}
          `}
				>
					<ImagePlus size={26} className="mb-1" />
					<span className="text-xs font-medium">Thêm ảnh</span>
				</button>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				multiple
				hidden
				onChange={onSelect}
			/>
		</div>
	);
};
