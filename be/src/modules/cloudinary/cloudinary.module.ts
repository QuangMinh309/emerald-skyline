// cloudinary.module.ts
import { Module } from "@nestjs/common";
import { CloudinaryController } from "src/modules/cloudinary/cloudinary.controller";
import { CloudinaryProvider } from "src/modules/cloudinary/cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";

@Module({
	providers: [CloudinaryProvider, CloudinaryService],
	controllers: [CloudinaryController],
	exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
