import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "../accounts/entities/account.entity";
import { Apartment } from "../apartments/entities/apartment.entity";
import { ApartmentResident } from "../apartments/entities/apartment-resident.entity";
import { Block } from "../blocks/entities/block.entity";
import { TargetBlock } from "../notifications/entities/target-block.entity";
import { Resident } from "../residents/entities/resident.entity";
import { SupabaseStorageModule } from "../supabase-storage/supabase-storage.module";
import { Option } from "./entities/option.entity";
import { ResidentOption } from "./entities/resident-option.entity";
import { Voting } from "./entities/voting.entity";
import { VotingsController } from "./votings.controller";
import { VotingsService } from "./votings.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Voting,
			Option,
			ResidentOption,
			TargetBlock,
			Block,
			Apartment,
			ApartmentResident,
			Resident,
			Account,
		]),
		SupabaseStorageModule,
	],
	controllers: [VotingsController],
	providers: [VotingsService],
	exports: [VotingsService],
})
export class VotingsModule {}
