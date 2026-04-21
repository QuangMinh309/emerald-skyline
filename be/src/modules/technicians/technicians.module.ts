import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaintenanceTicket } from "../maintenance-tickets/entities/maintenance-ticket.entity";
import { Technician } from "./entities/technician.entity";
import { TechniciansController } from "./technicians.controller";
import { TechniciansService } from "./technicians.service";

@Module({
	imports: [TypeOrmModule.forFeature([Technician, MaintenanceTicket])],
	controllers: [TechniciansController],
	providers: [TechniciansService],
	exports: [TechniciansService],
})
export class TechniciansModule {}
