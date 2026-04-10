import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "../accounts/entities/account.entity";
import { Apartment } from "../apartments/entities/apartment.entity";
import { ApartmentResident } from "../apartments/entities/apartment-resident.entity";
import { Booking } from "../bookings/entities/booking.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Invoice } from "../invoices/entities/invoice.entity";
import { PaymentTransaction } from "../payments/entities/payment-transaction.entity";
import { Resident } from "./entities/resident.entity";
import { ResidentsController } from "./residents.controller";
import { ResidentsService } from "./residents.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Resident,
			Account,
			Invoice,
			Booking,
			PaymentTransaction,
			ApartmentResident,
			Apartment,
		]),
		CloudinaryModule,
	],
	controllers: [ResidentsController],
	providers: [ResidentsService],
	exports: [ResidentsService],
})
export class ResidentsModule {}
