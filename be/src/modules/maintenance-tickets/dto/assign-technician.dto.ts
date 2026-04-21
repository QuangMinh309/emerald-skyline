import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class AssignTechnicianDto {
	@ApiProperty({
		example: 50,
		description: "Technician ID to assign",
	})
	@IsInt()
	@IsNotEmpty()
	technicianId: number;

	@ApiProperty({
		example: 800000,
		description: "Estimated cost for this maintenance",
	})
	@IsNumber()
	@Min(0, { message: "Chi phí dự kiến phải >= 0" })
	@IsNotEmpty({ message: "Chi phí dự kiến không được để trống" })
	@Type(() => Number)
	estimatedCost: number;
}
