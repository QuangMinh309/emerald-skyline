import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import getDatabaseConfig from "./configs/database.config";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ApartmentsModule } from "./modules/apartments/apartments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BlocksModule } from "./modules/blocks/blocks.module";
import { CloudinaryModule } from "./modules/cloudinary/cloudinary.module";
import { MailerModule } from "./modules/mailer/mailer.module";
import { ResidentsModule } from "./modules/residents/residents.module";
import { SupabaseStorageModule } from "./modules/supabase-storage/supabase-storage.module";

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
		SupabaseStorageModule,
		ResidentsModule,
		BlocksModule,
		ApartmentsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
