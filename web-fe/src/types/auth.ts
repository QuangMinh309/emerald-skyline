export type UserRole = "ADMIN" | "RESIDENT" | "TECHNICIAN";

export type ChangePasswordPayload = {
	oldPassword: string;
	newPassword: string;
};

export type AuthUser = {
	id: number;
	email: string;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type AuthResponse = AuthUser & {
	accessToken: string;
	refreshToken: string;
};
