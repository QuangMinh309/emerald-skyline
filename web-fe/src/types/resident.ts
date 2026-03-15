import type { GenderType } from "@/constants/genderType";

export interface ResidenceApartment {
	id: number;
	roomNumber: string;
	blockName: string;
	area: number;
}

export interface ResidenceInfo {
	id: number;
	apartmentId: number;
	apartment: ResidenceApartment;
	relationship: string;
}

export interface Resident {
	id: number;
	accountId: number;
	account: {
		id: number;
		email: string;
		role: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	};
	fullName: string;
	citizenId: string;
	imageUrl: null | string;
	dob: string;
	gender: GenderType;
	phoneNumber: string;
	nationality: string;
	province: string;
	ward: string;
	detailAddress: null | string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	residences?: ResidenceInfo[];
}

export interface ResidentDetail {
	id: number;
	accountId: number;
	account: {
		id: number;
		email: string;
		role: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	};
	fullName: string;
	citizenId: string;
	imageUrl: null;
	dob: string;
	gender: GenderType;
	phoneNumber: string;
	nationality: string;
	province: string;
	ward: string;
	detailAddress: null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	residences?: ResidenceInfo[];
}

export interface ResidenceApartment {
	id: number;
	roomNumber: string;
	blockName: string;
	area: number;
}

export interface ResidenceInfo {
	id: number;
	apartmentId: number;
	apartment: ResidenceApartment;
	relationship: string;
}

export interface ResidentResidences {
	residences: ResidenceInfo[];
}
