import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { ChecklistItemDto } from "./create-maintenance-ticket.dto";

export class UpdateProgressDto {
	@ApiProperty({
		type: [ChecklistItemDto],
		description: "Updated checklist items with completion status",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ChecklistItemDto)
	checklistItems: ChecklistItemDto[];
}
