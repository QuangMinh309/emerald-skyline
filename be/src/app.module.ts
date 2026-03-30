import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import getDatabaseConfig from "./configs/database.config";
import { AccountsModule } from "./modules/accounts/accounts.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: getDatabaseConfig,
		}),
		AccountsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
