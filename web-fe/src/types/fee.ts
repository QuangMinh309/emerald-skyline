export interface Fee {
	id: number;
	name: string;
	unit: string;
	type: "FIXED" | "METERED" | "FIXED_MONTH" | "OTHER";
	description: string;
	tierCount: number;
	createdAt: string;
}
export interface FeeDetail {
	id: number;
	name: string;
	unit: string;
	type: "FIXED" | "METERED" | "FIXED_MONTH" | "OTHER";
	description: string;
	tiers: {
		id: number;
		name: string;
		fromValue: number;
		toValue: number | null;
		unitPrice: number;
	}[];
}
