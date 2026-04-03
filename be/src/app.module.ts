import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import getDatabaseConfig from "./configs/database.config";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { AiModule } from "./modules/ai/ai.module";
import { ApartmentsModule } from "./modules/apartments/apartments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BlocksModule } from "./modules/blocks/blocks.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { CloudinaryModule } from "./modules/cloudinary/cloudinary.module";
import { FeesModule } from "./modules/fees/fees.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { MailerModule } from "./modules/mailer/mailer.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ResidentsModule } from "./modules/residents/residents.module";
import { ServicesModule } from "./modules/services/services.module";
import { SupabaseStorageModule } from "./modules/supabase-storage/supabase-storage.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: getDatabaseConfig,
		}),
		ScheduleModule.forRoot(),
		AuthModule,
		AccountsModule,
		MailerModule,
		CloudinaryModule,
		SupabaseStorageModule,
		ResidentsModule,
		BlocksModule,
		ApartmentsModule,
		ServicesModule,
		BookingsModule,
		InvoicesModule,
		PaymentsModule,
		FeesModule,
		AiModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
