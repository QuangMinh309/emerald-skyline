import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { QueryDto } from "src/dtos/query.dto";
import { UserRole } from "../enums/user-role.enum";

export class QueryAccountDto extends QueryDto {
	@ApiPropertyOptional({
		description: "Filter by role",
		enum: UserRole,
		example: UserRole.RESIDENT,
	})
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@ApiPropertyOptional({
		description: "Filter by active status",
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === "boolean") return value;
		if (value === "true") return true;
		if (value === "false") return false;
		if (value === undefined || value === null) return undefined;
		return Boolean(value);
	})
	isActive?: boolean;
}
