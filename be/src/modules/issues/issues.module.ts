import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "../accounts/accounts.module";
import { Block } from "../blocks/entities/block.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Resident } from "../residents/entities/resident.entity";
import { SystemNotificationsModule } from "../system-notifications/system-notifications.module";
import { Issue } from "./entities/issue.entity";
import { IssuesController } from "./issues.controller";
import { IssuesService } from "./issues.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Issue, Resident, Block]),
		CloudinaryModule,
		SystemNotificationsModule,
		AccountsModule,
	],
	controllers: [IssuesController],
	providers: [IssuesService],
	exports: [IssuesService],
})
export class IssuesModule {}
