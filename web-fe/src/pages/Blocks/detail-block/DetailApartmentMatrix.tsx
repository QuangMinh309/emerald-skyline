import { Label } from "@/components/ui/label";
import type { ApartmentType } from "@/pages/Blocks/create-block/ApartmentMatrix";
import type { BlockDetail } from "@/types/block";
import React, { useMemo } from "react";
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

interface Props {
	block: BlockDetail;
}

export const DetailApartmentMatrix: React.FC<Props> = ({ block }) => {
	const floors = useMemo(() => {
		const map = new Map<number, BlockDetail["apartments"]>();

		block.apartments.forEach((apt) => {
			if (!map.has(apt.floor)) map.set(apt.floor, []);
			map.get(apt.floor)!.push(apt);
		});

		return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
	}, [block.apartments]);

	return (
		<div className="max-w-[1134px] space-y-4">
			{/* Summary */}
			<div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
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
			</div>

			{/* Matrix */}
			<div className="p-4 rounded-xl border overflow-auto bg-white shadow-sm">
				<div className="flex flex-col gap-3 min-w-max">
					{floors.map(([floor, apartments]) => (
						<div key={floor} className="flex gap-2 items-center">
							{/* Floor label */}
							<div className="w-20 h-14 rounded bg-main text-white flex flex-col items-center justify-center font-semibold rounded-l-xl">
								<p className="text-xs">Tầng</p>
								<p className="text-lg">{floor}</p>
							</div>

							{/* Apartments */}
							{apartments
								.sort((a, b) => a.roomName.localeCompare(b.roomName))
								.map((apt) => {
									const color = APARTMENT_TYPE_COLORS[
										apt.type as ApartmentType
									] ?? {
										bg: "bg-gray-100",
										text: "text-gray-500",
										label: apt.type,
									};

									return (
										<div
											key={apt.id}
											className={`w-24 h-14 rounded-lg border flex flex-col items-center justify-center text-xs ${color.bg} ${color.text}`}
										>
											<div className="font-semibold">{apt.roomName}</div>
											<div className="text-[10px]">{apt.area} m²</div>
										</div>
									);
								})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
