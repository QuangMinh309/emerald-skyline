import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "src/modules/accounts/accounts.module";
import { SystemNotification } from "./entities/system-notification.entity";
import { SystemUserNotification } from "./entities/user-notification.entity";
import { SystemNotificationsController } from "./system-notifications.controller";
import { SystemNotificationsService } from "./system-notifications.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([SystemNotification, SystemUserNotification]),
		AccountsModule,
	],
	controllers: [SystemNotificationsController],
	providers: [SystemNotificationsService],
	exports: [SystemNotificationsService],
})
export class SystemNotificationsModule {}
