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
	id: string;
	code: string;
	floor: number;
	index: number;
	area: number;
	type: ApartmentType;
}

export interface ApartmentMatrixProps {
	apartmentsPerFloor: number;
	areasPerApartment: number;
	totalFloors: number;
	typesOfApartment: ApartmentType;
	blockName?: string;
	onApartmentsChange?: (apartments: Apartment[]) => void;
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

/* ================= GENERATOR ================= */

export function generateApartments(props: ApartmentMatrixProps): Apartment[] {
	const {
		apartmentsPerFloor,
		areasPerApartment,
		totalFloors,
		typesOfApartment,
		blockName = "A",
	} = props;

	const result: Apartment[] = [];

	for (let floor = 1; floor <= totalFloors; floor++) {
		for (let index = 1; index <= apartmentsPerFloor; index++) {
			const code = `${blockName}-${floor.toString().padStart(2, "0")}.${index.toString().padStart(2, "0")}`;

			result.push({
				id: crypto.randomUUID(),
				code,
				floor,
				index,
				area: areasPerApartment,
				type: typesOfApartment,
			});
		}
	}

	return result;
}

/* ================= COMPONENT ================= */

export const ApartmentMatrix: React.FC<ApartmentMatrixProps> = (props) => {
	const initialApartments = useMemo(() => generateApartments(props), []);
	const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
	const [selected, setSelected] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<{
		code: string;
		area: number;
		type: ApartmentType;
	} | null>(null);

	// Notify parent when apartments change
	useEffect(() => {
		props.onApartmentsChange?.(apartments);
	}, [apartments, props.onApartmentsChange]);

	const floors = useMemo(() => {
		const map = new Map<number, Apartment[]>();
		apartments.forEach((a) => {
			if (!map.has(a.floor)) map.set(a.floor, []);
			map.get(a.floor)!.push(a);
		});
		return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
	}, [apartments]);

	// Get max floor number
	const maxFloor = useMemo(() => {
		return floors.length > 0 ? Math.max(...floors.map(([f]) => f)) : 0;
	}, [floors]);

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

	// Delete single apartment
	const deleteApartment = useCallback(
		(id: string) => {
			setApartments((prev) => prev.filter((a) => a.id !== id));
			if (selected === id) setSelected(null);
			if (editingId === id) {
				setEditingId(null);
				setEditForm(null);
			}
		},
		[selected, editingId],
	);

	// Delete entire floor
	const deleteFloor = useCallback((floor: number) => {
		setApartments((prev) => prev.filter((a) => a.floor !== floor));
		setSelected(null);
		setEditingId(null);
		setEditForm(null);
	}, []);

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
	const startEdit = useCallback((apt: Apartment) => {
		setEditingId(apt.id);
		setEditForm({
			code: apt.code,
			area: apt.area,
			type: apt.type,
		});
	}, []);

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

			<div className="p-4 rounded-xl border overflow-auto mt-4 bg-white shadow-sm ">
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
						{floors.map(([floor, list]) => (
							<div key={floor} className="flex gap-2">
								<div
									key={floor}
									className="w-20 h-14 rounded bg-main text-white flex flex-col items-center justify-center text-sm font-semibold rounded-l-[15px]"
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
													className="w-[300px] rounded-lg border-2 border-main  p-3 flex flex-col gap-2 shadow-xl"
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
													<div className="flex gap-2 justify-end pt-1 ">
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
												onClick={() => setSelected(apt.id)}
												className={`w-24 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer relative group ${colors.bg} ${colors.text} border-transparent hover:border-main/45 hover:shadow-sm `}
											>
												<div className="font-semibold">{apt.code}</div>
												<div className="text-[10px]">{apt.area} m²</div>

												{/* Hover actions */}
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
															deleteApartment(apt.id);
														}}
														className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-150 active:scale-90 shadow"
														title="Xóa"
													>
														<Trash2 size={12} />
													</button>
												</div>
											</div>
										);
									})}

								{/* Right actions */}
								<div className="flex gap-2">
									<button
										onClick={() => addApartmentToFloor(floor)}
										className="w-24 h-14 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-xs text-gray-400 hover:border-main hover:text-main hover:bg-main/5 transition-all duration-200 active:scale-95"
										title="Thêm căn hộ"
									>
										<Plus size={16} />
									</button>
									<button
										onClick={() => deleteFloor(floor)}
										className="w-24 h-14 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-xs text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
										title="Xóa tầng"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
