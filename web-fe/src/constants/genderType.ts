export const GenderType = {
	FEMALE: "FEMALE",
	MALE: "MALE",
} as const;
// cái này là enum trong ts
export type GenderType = (typeof GenderType)[keyof typeof GenderType];

// cái này dành cho select option
export const GenderTypeOptions = [
	{ value: GenderType.FEMALE, label: "Nữ" },
	{ value: GenderType.MALE, label: "Nam" },
];
