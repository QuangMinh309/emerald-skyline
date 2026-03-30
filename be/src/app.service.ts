import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getHello(): string {
		return "Emerald Skyline Management System API - Online";
	}
}
