import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsModule } from "../bookings/bookings.module";
import { Booking } from "../bookings/entities/booking.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Resident } from "../residents/entities/resident.entity";
import { Service } from "./entities/service.entity";
import { SlotAvailability } from "./entities/slot-availability.entity";
import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Service, SlotAvailability, Resident, Booking]),
		CloudinaryModule,
		forwardRef(() => BookingsModule),
	],
	controllers: [ServicesController],
	providers: [ServicesService],
	exports: [ServicesService],
})
export class ServicesModule {}
