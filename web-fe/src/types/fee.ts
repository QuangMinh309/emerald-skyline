const fee = {
	id: 1,
	name: "Tiền điện",
	unit: "kwh",
	type: "METERED",
	description: "Phí tiền điện sinh hoạt theo bậc thang EVN",
	tiers: [
		{
			id: 1,
			name: "Bậc 1",
			fromValue: 0,
			toValue: 50,
			unitPrice: 1806,
		},
		{
			id: 2,
			name: "Bậc 2",
			fromValue: 50,
			toValue: 100,
			unitPrice: 1866,
		},
		{
			id: 3,
			name: "Bậc 3",
			fromValue: 100,
			toValue: 200,
			unitPrice: 2167,
		},
		{
			id: 4,
			name: "Bậc 4",
			fromValue: 200,
			toValue: 300,
			unitPrice: 2729,
		},
		{
			id: 5,
			name: "Bậc 5",
			fromValue: 300,
			toValue: 400,
			unitPrice: 3050,
		},
		{
			id: 6,
			name: "Bậc 6",
			fromValue: 400,
			toValue: null,
			unitPrice: 3151,
		},
	],
};
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
