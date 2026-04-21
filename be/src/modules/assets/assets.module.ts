import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetType } from "../asset-types/entities/asset-type.entity";
import { Block } from "../blocks/entities/block.entity";
import { MaintenanceTicket } from "../maintenance-tickets/entities/maintenance-ticket.entity";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { Asset } from "./entities/asset.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Asset, AssetType, Block, MaintenanceTicket]),
	],
	controllers: [AssetsController],
	providers: [AssetsService],
	exports: [AssetsService],
})
export class AssetsModule {}
