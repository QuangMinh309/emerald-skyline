import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import getDatabaseConfig from "./configs/database.config";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CloudinaryModule } from "./modules/cloudinary/cloudinary.module";
import { MailerModule } from "./modules/mailer/mailer.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: getDatabaseConfig,
		}),
		AuthModule,
		AccountsModule,
		MailerModule,
		CloudinaryModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
