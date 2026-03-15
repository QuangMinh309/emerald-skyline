import { useBlocks } from "@/hooks/data/useBlocks";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

export interface BlockConfig {
	blockId: string;
	floorNumbers: string[];
}

interface ScopeSelectorProps {
	targetScope: string;
	onScopeChange: (val: "ALL" | "BLOCK" | "FLOOR") => void;
	selectedBlocks: BlockConfig[];
	onChangeBlocks: (configs: BlockConfig[]) => void;
	label?: String;
}

export const ScopeSelector = ({
	targetScope,
	onScopeChange,
	selectedBlocks,
	onChangeBlocks,
	label = "Đối tượng nhận thông báo",
}: ScopeSelectorProps) => {
	const { data: blocks } = useBlocks();

	// chỉ lấy các block đang vận hành
	const activeBlocks = useMemo(() => {
		return blocks?.filter((b) => b.status === "OPERATING") || [];
	}, [blocks]);

	const isBlockSelected = (id: string) =>
		selectedBlocks.some((b) => b.blockId === id);

	// chọn, bỏ chọn tòa nhà
	const toggleBlock = (blockId: string) => {
		if (isBlockSelected(blockId)) {
			onChangeBlocks(selectedBlocks.filter((b) => b.blockId !== blockId));
		} else {
			onChangeBlocks([...selectedBlocks, { blockId, floorNumbers: [] }]);
		}
	};

	const toggleFloor = (blockId: string, floorNum: string) => {
		const newConfigs = selectedBlocks.map((config) => {
			if (config.blockId !== blockId) return config;

			const currentFloors = config.floorNumbers;
			const newFloors = currentFloors.includes(floorNum)
				? currentFloors.filter((f) => f !== floorNum)
				: [...currentFloors, floorNum];

			return { ...config, floorNumbers: newFloors };
		});
		onChangeBlocks(newConfigs);
	};

	return (
		<div className="space-y-3">
			<RequiredLabel isRequired>{label}</RequiredLabel>

			<RadioGroup
				value={targetScope}
				onValueChange={(v) => {
					onScopeChange(v as "ALL" | "BLOCK" | "FLOOR");
					onChangeBlocks([]);
				}}
				className="grid grid-cols-1 sm:grid-cols-3 gap-3"
			>
				{[
					{ value: "ALL", label: "Toàn chung cư" },
					{ value: "BLOCK", label: "Theo tòa nhà" },
					{ value: "FLOOR", label: "Theo tầng" },
				].map((opt) => (
					<div
						key={opt.value}
						className={cn(
							"flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors",
							targetScope === opt.value
								? "border-main bg-main/5"
								: "border-gray-200 hover:bg-gray-50",
						)}
					>
						<RadioGroupItem
							value={opt.value}
							id={`scope-${opt.value}`}
							className="text-main border-main"
						/>
						<Label
							htmlFor={`scope-${opt.value}`}
							className="text-sm cursor-pointer font-medium text-gray-700 w-full"
						>
							{opt.label}
						</Label>
					</div>
				))}
			</RadioGroup>

			{targetScope !== "ALL" && (
				<div className="mt-2 space-y-5 animate-in fade-in zoom-in-95 duration-200 border-l-2 border-main/20 pl-4 ml-1">
					{/* danh sách các tòa */}
					<div className="space-y-2">
						<RequiredLabel isRequired>
							{targetScope === "BLOCK"
								? "Chọn các tòa nhà áp dụng"
								: "Chọn tòa nhà để xem tầng"}
						</RequiredLabel>
						<div className="flex flex-wrap gap-2">
							{/* dùng activeBlocks */}
							{activeBlocks.length === 0 && (
								<span className="text-sm text-gray-500 italic">
									Không có tòa nhà nào đang vận hành.
								</span>
							)}
							{activeBlocks.map((b) => {
								const selected = isBlockSelected(b.id.toString());
								return (
									<button
										key={b.id}
										type="button"
										onClick={() => toggleBlock(b.id.toString())}
										className={cn(
											"px-4 py-2 rounded-md text-xs font-medium border transition-all",
											selected
												? "bg-main text-white border-main shadow-sm"
												: "bg-white text-gray-600 border-gray-300 hover:border-main hover:text-main",
										)}
									>
										{b.buildingName}
									</button>
								);
							})}
						</div>
					</div>

					{targetScope === "FLOOR" && selectedBlocks.length > 0 && (
						<div className="space-y-4 pt-2">
							<RequiredLabel isRequired>
								Chi tiết tầng cho các tòa đã chọn
							</RequiredLabel>

							<div className="grid grid-cols-1 gap-4">
								{selectedBlocks.map((config) => {
									// tìm thông tin block trong danh sách activeBlocks
									const blockInfo = activeBlocks.find(
										(b) => b.id.toString() === config.blockId,
									);
									if (!blockInfo) return null;

									const totalFloors = blockInfo.totalFloors || 10;
									const floors = Array.from({ length: totalFloors }, (_, i) =>
										(i + 1).toString(),
									);

									return (
										<div
											key={config.blockId}
											className="border rounded-md p-4 bg-gray-50/50"
										>
											<p className="font-bold text-sm text-main mb-3 flex items-center justify-between">
												{blockInfo.buildingName}
												<span className="text-[10px] font-normal text-gray-500 bg-white px-2 py-0.5 rounded border">
													{config.floorNumbers.length} tầng được chọn
												</span>
											</p>

											<div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
												{floors.map((floorNum) => {
													const isFloorSelected =
														config.floorNumbers.includes(floorNum);
													return (
														<div
															key={floorNum}
															onClick={() =>
																toggleFloor(config.blockId, floorNum)
															}
															className={cn(
																"cursor-pointer text-xs text-center py-1.5 border rounded transition-all select-none",
																isFloorSelected
																	? "bg-secondary text-white border-secondary font-bold shadow-sm"
																	: "bg-white text-gray-500 border-gray-200 hover:border-secondary hover:text-secondary",
															)}
														>
															Tầng {floorNum}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
