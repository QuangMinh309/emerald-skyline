import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { QueryDto } from "../../../dtos/query.dto";
import { ApartmentType } from "../enums/apartment-type.enum";

export class QueryApartmentDto extends QueryDto {
	@ApiPropertyOptional({
		description: "Filter by apartment type",
		enum: ApartmentType,
		example: ApartmentType.STUDIO,
	})
	@IsOptional()
	@IsEnum(ApartmentType)
	type?: ApartmentType;

	@ApiPropertyOptional({
		description: "Filter by block ID",
		example: 1,
	})
	@IsOptional()
	@IsInt()
	@Type(() => Number)
	blockId?: number;
}
