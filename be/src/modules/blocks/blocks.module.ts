import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Apartment } from "../apartments/entities/apartment.entity";
import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";
import { Block } from "./entities/block.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Block, Apartment])],
	controllers: [BlocksController],
	providers: [BlocksService],
	exports: [BlocksService],
})
export class BlocksModule {}
