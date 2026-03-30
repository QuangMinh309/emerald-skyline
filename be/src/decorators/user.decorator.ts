import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserRole } from "../modules/accounts/enums/user-role.enum";

export interface ActiveUser {
	id: number;
	email: string;
	role: UserRole;
}

export const CurrentUser = createParamDecorator(
	(data: keyof ActiveUser | undefined, ctx: ExecutionContext) => {
		const request = ctx
			.switchToHttp()
			.getRequest<Request & { user: ActiveUser }>();
		const user = request.user;
		return data ? user?.[data] : user;
	},
);
