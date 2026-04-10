import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentsModule } from "../payments/payments.module";
import { Resident } from "../residents/entities/resident.entity";
import { SlotAvailability } from "../services/entities/slot-availability.entity";
import { ServicesModule } from "../services/services.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { Booking } from "./entities/booking.entity";
import { BookingPayment } from "./entities/booking-payment.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Booking,
			BookingPayment,
			SlotAvailability,
			Resident,
		]),
		forwardRef(() => ServicesModule),
		PaymentsModule,
	],
	controllers: [BookingsController],
	providers: [BookingsService],
	exports: [BookingsService],
})
export class BookingsModule {}
