import React, { useMemo, useState, useEffect, useCallback } from "react";

/* ================= TYPES ================= */
import { Plus, Trash2, Check, X, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ApartmentTypeOptions } from "@/constants/apartmentType";

export type ApartmentType =
	| "STUDIO"
	| "ONE_BEDROOM"
	| "TWO_BEDROOM"
	| "PENTHOUSE";

export interface Apartment {
	id?: string | number;
	code: string;
	floor: number;
	index: number;
	area: number;
	type: ApartmentType;
	hasResidents?: boolean;
}

export interface UpdateApartmentMatrixProps {
	apartmentsPerFloor: number;
	areasPerApartment: number;
	totalFloors: number;
	typesOfApartment: ApartmentType;
	blockName?: string;
	onApartmentsChange?: (apartments: Apartment[]) => void;
	existingApartments?: Apartment[];
	hasResidents: boolean;
}

// Color mapping for apartment types
export const APARTMENT_TYPE_COLORS: Record<
	ApartmentType,
	{ bg: string; bgActive: string; text: string; Label: string }
> = {
	STUDIO: {
		bg: "bg-gray-200",
		bgActive: "bg-gray-400",
		text: "text-gray-700",
		Label: "Studio",
	},
	ONE_BEDROOM: {
		bg: "bg-green-200",
		bgActive: "bg-green-400",
		text: "text-green-700",
		Label: "1 Phòng ngủ",
	},
	TWO_BEDROOM: {
		bg: "bg-yellow-200",
		bgActive: "bg-yellow-400",
		text: "text-yellow-700",
		Label: "2 Phòng ngủ",
	},
	PENTHOUSE: {
		bg: "bg-purple-200",
		bgActive: "bg-purple-400",
		text: "text-purple-700",
		Label: "Penthouse",
	},
};

/* ================= COMPONENT ================= */

export const UpdateApartmentMatrix: React.FC<UpdateApartmentMatrixProps> = (
	props,
) => {
	const { existingApartments = [], hasResidents } = props;

	const [apartments, setApartments] = useState<Apartment[]>(existingApartments);
	const [selected, setSelected] = useState<string | number | null>(null);
	const [editingId, setEditingId] = useState<string | number | null>(null);
	const [editForm, setEditForm] = useState<{
		code: string;
		area: number;
		type: ApartmentType;
	} | null>(null);

	// Track dynamic totalFloors based on max floor in apartments
	const [dynamicTotalFloors, setDynamicTotalFloors] = useState(
		props.totalFloors,
	);

	// Initialize with existing apartments
	useEffect(() => {
		if (existingApartments.length > 0) {
			setApartments(existingApartments);
			const maxFloorFromApts = Math.max(
				...existingApartments.map((a) => a.floor),
			);
			setDynamicTotalFloors(Math.max(maxFloorFromApts, props.totalFloors));
		}
	}, [existingApartments, props.totalFloors]);

	// Update totalFloors when apartments change
	useEffect(() => {
		if (apartments.length > 0) {
			const maxFloorFromApts = Math.max(...apartments.map((a) => a.floor));
			setDynamicTotalFloors(Math.max(maxFloorFromApts, props.totalFloors));
		}
	}, [apartments, props.totalFloors]);

	// Notify parent when apartments change
	useEffect(() => {
		props.onApartmentsChange?.(apartments);
	}, [apartments, props.onApartmentsChange]);

	const floors = useMemo(() => {
		const map = new Map<number, Apartment[]>();

		// Add all apartments to their floors
		apartments.forEach((a) => {
			if (!map.has(a.floor)) map.set(a.floor, []);
			map.get(a.floor)!.push(a);
		});

		// Also include empty floors up to dynamicTotalFloors
		for (let i = 1; i <= dynamicTotalFloors; i++) {
			if (!map.has(i)) {
				map.set(i, []);
			}
		}

		return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
	}, [apartments, dynamicTotalFloors]);

	// Get max floor number (include dynamicTotalFloors)
	const maxFloor = useMemo(() => {
		const maxFromApts =
			apartments.length > 0 ? Math.max(...apartments.map((a) => a.floor)) : 0;
		return Math.max(maxFromApts, dynamicTotalFloors);
	}, [apartments, dynamicTotalFloors]);

	// Get max index per floor
	const getMaxIndexForFloor = useCallback(
		(floor: number) => {
			const floorApts = apartments.filter((a) => a.floor === floor);
			return floorApts.length > 0
				? Math.max(...floorApts.map((a) => a.index))
				: 0;
		},
		[apartments],
	);

	// Check if floor has any residents
	const floorHasResidents = useCallback(
		(floor: number) => {
			const floorApts = apartments.filter((a) => a.floor === floor);
			return floorApts.some((apt) => apt.hasResidents);
		},
		[apartments],
	);

	// Delete single apartment
	const deleteApartment = useCallback(
		(id: string | number) => {
			const apt = apartments.find((a) => a.id === id);
			if (apt?.hasResidents && hasResidents) {
				alert(
					"⚠️ Không thể xóa căn hộ đã có người ở!\n\nLý do: Căn hộ này đang có cư dân sinh sống. Vui lòng chuyển cư dân đi trước khi xóa.",
				);
				return;
			}

			setApartments((prev) => prev.filter((a) => a.id !== id));
			if (selected === id) setSelected(null);
			if (editingId === id) {
				setEditingId(null);
				setEditForm(null);
			}
		},
		[selected, editingId, apartments, hasResidents],
	);

	// Delete all apartments in floor (but keep the floor)
	const deleteFloor = useCallback(
		(floor: number) => {
			const floorApts = apartments.filter((a) => a.floor === floor);
			const occupiedApts = floorApts.filter((a) => a.hasResidents);

			// If hasResidents is true, check if floor has residents
			if (hasResidents && occupiedApts.length > 0) {
				alert(
					`⚠️ Không thể xóa tầng ${floor}!\n\nLý do: Tầng này có ${occupiedApts.length} căn hộ đang có người ở.\nVui lòng chuyển tất cả cư dân đi trước khi xóa tầng.`,
				);
				return;
			}

			// Delete all apartments on this floor
			setApartments((prev) => prev.filter((a) => a.floor !== floor));
			setSelected(null);
			setEditingId(null);
			setEditForm(null);
		},
		[hasResidents, apartments],
	);

	// Add new floor
	const addFloor = useCallback(() => {
		const newFloor = maxFloor + 1;
		const newApartments: Apartment[] = [];
		const blockName = props.blockName || "A";

		for (let index = 1; index <= props.apartmentsPerFloor; index++) {
			const code = `${blockName}-${newFloor.toString().padStart(2, "0")}.${index.toString().padStart(2, "0")}`;

			newApartments.push({
				id: crypto.randomUUID(),
				code,
				floor: newFloor,
				index,
				area: props.areasPerApartment,
				type: props.typesOfApartment,
				hasResidents: false,
			});
		}

		setApartments((prev) => [...prev, ...newApartments]);
	}, [
		maxFloor,
		props.apartmentsPerFloor,
		props.areasPerApartment,
		props.typesOfApartment,
		props.blockName,
	]);

	// Add apartment to existing floor
	const addApartmentToFloor = useCallback(
		(floor: number) => {
			const maxIndex = getMaxIndexForFloor(floor);
			const newIndex = maxIndex + 1;
			const blockName = props.blockName || "A";
			const code = `${blockName}-${floor.toString().padStart(2, "0")}.${newIndex.toString().padStart(2, "0")}`;

			const newApartment: Apartment = {
				id: crypto.randomUUID(),
				code,
				floor,
				index: newIndex,
				area: props.areasPerApartment,
				type: props.typesOfApartment,
				hasResidents: false,
			};

			setApartments((prev) => [...prev, newApartment]);
		},
		[
			getMaxIndexForFloor,
			props.areasPerApartment,
			props.typesOfApartment,
			props.blockName,
		],
	);

	// Start editing
	const startEdit = useCallback(
		(apt: Apartment) => {
			if (apt.hasResidents && hasResidents) {
				alert(
					`⚠️ Không thể chỉnh sửa căn hộ ${apt.code}!\n\nLý do: Căn hộ này đang có cư dân sinh sống. Việc thay đổi mã căn hộ, diện tích hoặc loại có thể ảnh hưởng đến dữ liệu cư dân, hợp đồng và thanh toán.\n\nGợi ý: Nếu cần thay đổi thông tin, vui lòng liên hệ quản lý hệ thống.`,
				);
				return;
			}

			setEditingId(apt.id!);
			setEditForm({
				code: apt.code,
				area: apt.area,
				type: apt.type,
			});
		},
		[hasResidents],
	);

	// Save edit
	const saveEdit = useCallback(() => {
		if (!editingId || !editForm) return;

		setApartments((prev) =>
			prev.map((a) =>
				a.id === editingId
					? {
							...a,
							code: editForm.code,
							area: editForm.area,
							type: editForm.type,
						}
					: a,
			),
		);
		setEditingId(null);
		setEditForm(null);
	}, [editingId, editForm]);

	// Cancel edit
	const cancelEdit = useCallback(() => {
		setEditingId(null);
		setEditForm(null);
	}, []);

	// Calculate total apartments
	const totalApartments = apartments.length;

	return (
		<div className="max-w-[1134px]">
			{hasResidents && (
				<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-blue-800 text-sm">
						<span className="font-semibold">ℹ️ Lưu ý:</span> Căn hộ có người ở sẽ
						không thể sửa/xóa. Bạn vẫn có thể thêm tầng/căn hộ mới hoặc chỉnh
						sửa các căn hộ trống.
					</p>
				</div>
			)}

			<div className="p-4 rounded-xl border bg-white shadow-sm">
				<div className="flex items-center gap-3 flex-wrap">
					<Label className="font-medium">Chọn loại phòng</Label>
					{(Object.keys(APARTMENT_TYPE_COLORS) as ApartmentType[]).map(
						(type) => (
							<div
								key={type}
								className={`rounded ${APARTMENT_TYPE_COLORS[type].bg} ${APARTMENT_TYPE_COLORS[type].text} px-2 py-1 text-sm font-medium`}
							>
								{APARTMENT_TYPE_COLORS[type].Label}
							</div>
						),
					)}
				</div>
				<div className="flex items-center gap-3 mt-2">
					<Label className="font-medium">Tổng số phòng</Label>
					<div className="text-gray-700 text-sm font-semibold">
						{totalApartments}
					</div>
				</div>
			</div>

			<div className="p-4 rounded-xl border overflow-auto mt-4 bg-white shadow-sm">
				<div className="flex gap-3 min-w-max">
					{/* Apartments grid */}
					<div className="flex flex-col gap-2">
						{/* Header spacer */}
						<button
							onClick={addFloor}
							className="w-20 h-14 rounded bg-main text-white flex flex-col items-center justify-center text-sm font-semibold rounded-l-[15px] hover:bg-main/80 transition-all duration-200 active:scale-95"
							title="Thêm tầng mới"
						>
							<Plus size={18} />
							<span className="text-[10px]">Thêm tầng</span>
						</button>
						{floors.map(([floor, list]) => {
							const hasResidentsInFloor = floorHasResidents(floor);
							return (
								<div key={floor} className="flex gap-2">
									<div
										key={floor}
										className={`w-20 h-14 rounded flex flex-col items-center justify-center text-sm font-semibold rounded-l-[15px] ${
											hasResidentsInFloor ? "bg-red-500" : "bg-main"
										} text-white`}
									>
										<p className="text-xs">Tầng</p>
										<p className="text-lg font-bold">{floor}</p>
									</div>
									{list
										.sort((a, b) => a.index - b.index)
										.map((apt) => {
											const isEditing = apt.id === editingId;
											const colors = APARTMENT_TYPE_COLORS[apt.type];

											if (isEditing && editForm) {
												return (
													<div
														key={apt.id}
														className="w-[300px] rounded-lg border-2 border-main p-3 flex flex-col gap-2 shadow-xl"
													>
														<div className="flex gap-2 items-center">
															<Label className="text-xs font-semibold text-gray-600 w-[50px]">
																Mã
															</Label>
															<Input
																value={editForm.code}
																onChange={(e) =>
																	setEditForm({
																		...editForm,
																		code: e.target.value,
																	})
																}
																placeholder="Ví dụ: A-01.01"
															/>
														</div>
														<div className="flex gap-2 items-center">
															<Label className="text-xs font-semibold text-gray-600 w-[50px]">
																Diện tích (m²)
															</Label>
															<Input
																type="number"
																value={editForm.area}
																onChange={(e) =>
																	setEditForm({
																		...editForm,
																		area: Number(e.target.value),
																	})
																}
																placeholder="m²"
															/>
														</div>
														<div className="flex gap-2 items-center">
															<Label className="text-xs font-semibold text-gray-600 w-[50px]">
																Loại
															</Label>
															<Select
																onValueChange={(values) => {
																	setEditForm({
																		...editForm,
																		type: values as ApartmentType,
																	});
																}}
																value={editForm.type}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Chọn loại căn hộ" />
																</SelectTrigger>
																<SelectContent>
																	{ApartmentTypeOptions?.map((type) => (
																		<SelectItem
																			key={type.value}
																			value={type.value}
																		>
																			{type.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
														<div className="flex gap-2 justify-end pt-1">
															<button
																onClick={saveEdit}
																className="px-4 py-1.5 rounded bg-main hover:bg-main/80 text-white text-xs font-semibold flex items-center gap-1 transition-all duration-150 active:scale-95 shadow"
																title="Lưu"
															>
																<Check size={14} />
																Lưu
															</button>
															<button
																onClick={cancelEdit}
																className="px-4 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1 transition-all duration-150 active:scale-95 shadow"
																title="Hủy"
															>
																<X size={14} />
																Hủy
															</button>
														</div>
													</div>
												);
											}

											return (
												<div
													key={apt.id}
													onClick={() => setSelected(apt.id!)}
													title={
														apt.hasResidents
															? `${apt.code} - Đang có cư dân (Không thể sửa/xóa)`
															: `${apt.code} - Căn hộ trống (Click để xem)`
													}
													className={`w-24 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer relative group ${
														colors.bg
													} ${
														colors.text
													} border-transparent hover:border-main/45 hover:shadow-sm ${
														apt.hasResidents
															? "opacity-70 ring-1 ring-red-300"
															: ""
													}`}
												>
													<div className="font-semibold">{apt.code}</div>
													<div className="text-[10px]">{apt.area} m²</div>
													{apt.hasResidents && (
														<div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-tl-lg rounded-br-lg font-semibold shadow-sm">
															Có người
														</div>
													)}

													{/* Hover actions */}
													{(!apt.hasResidents || !hasResidents) && (
														<div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5">
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	startEdit(apt);
																}}
																className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-150 active:scale-90 shadow"
																title="Sửa"
															>
																<Edit size={12} />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	deleteApartment(apt.id!);
																}}
																className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-150 active:scale-90 shadow"
																title="Xóa"
															>
																<Trash2 size={12} />
															</button>
														</div>
													)}
												</div>
											);
										})}

									{/* Right actions */}
									<div className="flex gap-2">
										<button
											onClick={() => addApartmentToFloor(floor)}
											className="w-24 h-14 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-main hover:text-main hover:bg-main/5 flex flex-col items-center justify-center text-xs transition-all duration-200 active:scale-95"
											title="Thêm căn hộ"
										>
											<Plus size={16} />
										</button>
										<button
											onClick={() => deleteFloor(floor)}
											disabled={hasResidents && hasResidentsInFloor}
											className={`w-24 h-14 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs transition-all duration-200 active:scale-95 ${
												hasResidents && hasResidentsInFloor
													? "border-gray-300 text-gray-400 cursor-not-allowed"
													: "border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50"
											}`}
											title={
												hasResidents && hasResidentsInFloor
													? "Không thể xóa căn hộ ở tầng có người ở"
													: "Xóa hết căn hộ tầng này"
											}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
