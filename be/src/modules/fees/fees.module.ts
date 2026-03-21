import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoiceDetail } from "../invoices/entities/invoice-detail.entity";
import { Fee } from "./entities/fee.entity";
import { FeeTier } from "./entities/fee-tier.entity";
import { FeesController } from "./fees.controller";
import { FeesService } from "./fees.service";

@Module({
	imports: [TypeOrmModule.forFeature([Fee, FeeTier, InvoiceDetail])],
	controllers: [FeesController],
	providers: [FeesService],
	exports: [FeesService],
})
export class FeesModule {}
