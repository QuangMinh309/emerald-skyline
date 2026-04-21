import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemNotificationsModule } from "src/modules/system-notifications/system-notifications.module";
import { Apartment } from "../apartments/entities/apartment.entity";
import { AssetsModule } from "../assets/assets.module";
import { Asset } from "../assets/entities/asset.entity";
import { Block } from "../blocks/entities/block.entity";
import { Issue } from "../issues/entities/issue.entity";
import { SupabaseStorageModule } from "../supabase-storage/supabase-storage.module";
import { Technician } from "../technicians/entities/technician.entity";
import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { MaintenanceTicketsController } from "./maintenance-tickets.controller";
import { MaintenanceTicketsService } from "./maintenance-tickets.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			MaintenanceTicket,
			Asset,
			Block,
			Apartment,
			Technician,
			Issue,
		]),
		AssetsModule,
		SupabaseStorageModule,
		SystemNotificationsModule,
	],
	controllers: [MaintenanceTicketsController],
	providers: [MaintenanceTicketsService],
	exports: [MaintenanceTicketsService],
})
export class MaintenanceTicketsModule {}
