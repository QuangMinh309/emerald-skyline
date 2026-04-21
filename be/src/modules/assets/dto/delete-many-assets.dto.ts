import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class DeleteManyAssetsDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: "Array of asset IDs to delete",
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1)
	@IsInt({ each: true })
	@Type(() => Number)
	ids: number[];
}
