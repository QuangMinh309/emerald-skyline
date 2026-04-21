import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { MaintenanceResult } from "../enums/maintenance-result.enum";
import { TicketStatus } from "../enums/ticket-status.enum";
import { TicketType } from "../enums/ticket-type.enum";

export class TicketHistoryItemDto {
	@ApiProperty({ example: 2022 })
	@Expose()
	id: number;

	@ApiProperty({ example: "Bảo trì định kỳ Q4/2025" })
	@Expose()
	title: string;

	@ApiProperty({ example: TicketType.MAINTENANCE, enum: TicketType })
	@Expose()
	type: TicketType;

	@ApiProperty({ example: TicketStatus.COMPLETED, enum: TicketStatus })
	@Expose()
	status: TicketStatus;

	@ApiProperty({ example: "2025-12-20" })
	@Expose()
	date: string;

	@ApiPropertyOptional({
		example: MaintenanceResult.GOOD,
		enum: MaintenanceResult,
	})
	@Expose()
	result?: MaintenanceResult;

	@ApiProperty({ example: "Nguyễn Văn A" })
	@Expose()
	technicianName: string;
}
