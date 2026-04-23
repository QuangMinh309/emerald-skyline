import { Global, Module } from "@nestjs/common"; // Thêm Global vào đây
import { CloudinaryController } from "src/modules/cloudinary/cloudinary.controller";
import { CloudinaryProvider } from "src/modules/cloudinary/cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";

@Global()
@Module({
	providers: [CloudinaryProvider, CloudinaryService],
	controllers: [CloudinaryController],
	exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
