import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Asset } from "../assets/entities/asset.entity";
import { AssetTypesController } from "./asset-types.controller";
import { AssetTypesService } from "./asset-types.service";
import { AssetType } from "./entities/asset-type.entity";

@Module({
	imports: [TypeOrmModule.forFeature([AssetType, Asset])],
	controllers: [AssetTypesController],
	providers: [AssetTypesService],
	exports: [AssetTypesService],
})
export class AssetTypesModule {}
