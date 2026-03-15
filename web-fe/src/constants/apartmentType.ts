export const ApartmentType = {
	STUDIO: "STUDIO",
	ONE_BEDROOM: "ONE_BEDROOM",
	TWO_BEDROOM: "TWO_BEDROOM",
	PENTHOUSE: "PENTHOUSE",
} as const;
// cái này dành cho select option
export const ApartmentTypeOptions = [
	{ value: ApartmentType.STUDIO, label: "Studio" },
	{ value: ApartmentType.ONE_BEDROOM, label: "Căn hộ 1 phòng ngủ" },
	{ value: ApartmentType.TWO_BEDROOM, label: "Căn hộ 2 phòng ngủ" },
	{ value: ApartmentType.PENTHOUSE, label: "Penthouse" },
];
