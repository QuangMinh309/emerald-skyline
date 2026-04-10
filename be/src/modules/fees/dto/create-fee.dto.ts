import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { FeeType } from "../enums/fee-type.enum";
import { CreateFeeTierDto } from "./create-fee-tier.dto";

export class CreateFeeDto {
	@ApiProperty({
		example: "Tiền điện",
		description: "Tên loại phí",
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		example: "kwh",
		description: "Đơn vị tính (kwh, m3, m2, slot)",
		required: false,
	})
	@IsString()
	@IsOptional()
	unit?: string;

	@ApiProperty({
		example: FeeType.METERED,
		description: "Loại phí",
		enum: FeeType,
	})
	@IsEnum(FeeType)
	@IsNotEmpty()
	type: FeeType;

	@ApiProperty({
		example: "Phí tiền điện theo bậc thang EVN",
		description: "Mô tả chi tiết",
		required: false,
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		type: [CreateFeeTierDto],
		description: "Danh sách bậc thang giá",
		required: false,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateFeeTierDto)
	@IsOptional()
	tiers?: CreateFeeTierDto[];
}
