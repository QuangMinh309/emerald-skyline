export interface Account {
	id: number;
	email: string;
	role: "ADMIN" | "RESIDENT" | "TECHNICIAN";
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAccountPayload {
	email: string;
	password: string;
	role: "ADMIN" | "RESIDENT" | "TECHNICIAN";
}

export interface UpdateAccountPayload {
	email?: string;
	password?: string;
	role?: "ADMIN" | "RESIDENT" | "TECHNICIAN";
	isActive?: boolean;
}
