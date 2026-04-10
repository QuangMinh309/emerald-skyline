import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class DeleteManyResidentsDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "Array of resident IDs to delete",
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1)
	@IsInt({ each: true })
	@Type(() => Number)
	ids: number[];
}
