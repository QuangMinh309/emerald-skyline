import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { TicketPriority } from "../enums/ticket-priority.enum";
import { TicketStatus } from "../enums/ticket-status.enum";
import { TicketType } from "../enums/ticket-type.enum";

export class QueryMaintenanceTicketDto {
	@ApiPropertyOptional({
		enum: TicketType,
		description: "Filter by ticket type",
	})
	@IsEnum(TicketType)
	@IsOptional()
	type?: TicketType;

	@ApiPropertyOptional({
		enum: TicketStatus,
		description: "Filter by ticket status",
	})
	@IsEnum(TicketStatus)
	@IsOptional()
	status?: TicketStatus;

	@ApiPropertyOptional({
		enum: TicketPriority,
		description: "Filter by priority",
	})
	@IsEnum(TicketPriority)
	@IsOptional()
	priority?: TicketPriority;

	@ApiPropertyOptional({
		example: 1,
		description: "Filter by block ID",
	})
	@IsInt()
	@IsOptional()
	blockId?: number;

	@ApiPropertyOptional({
		example: 50,
		description: "Filter by technician ID",
	})
	@IsInt()
	@IsOptional()
	technicianId?: number;

	@ApiPropertyOptional({
		example: 105,
		description: "Filter by asset ID",
	})
	@IsInt()
	@IsOptional()
	assetId?: number;
}
