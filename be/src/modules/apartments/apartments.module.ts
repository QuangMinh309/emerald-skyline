import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Block } from "../blocks/entities/block.entity";
import { Resident } from "../residents/entities/resident.entity";
import { ApartmentsController } from "./apartments.controller";
import { ApartmentsService } from "./apartments.service";
import { Apartment } from "./entities/apartment.entity";
import { ApartmentResident } from "./entities/apartment-resident.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Apartment, ApartmentResident, Block, Resident]),
	],
	controllers: [ApartmentsController],
	providers: [ApartmentsService],
	exports: [ApartmentsService],
})
export class ApartmentsModule {}
