import type { TechnicianStatus } from "@/constants/technicianStatus";

export interface Technician {
	id: number;
	fullName: string;
	phoneNumber: string;
	status: TechnicianStatus;
	description: string | null;
	createdAt: string;
}
export interface TechnicianDetail {
	id: number;
	fullName: string;
	phoneNumber: string;
	status: TechnicianStatus;
	description: string | null;
	createdAt: string;
}
