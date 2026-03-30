import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const getDatabaseConfig = (
	configService: ConfigService,
): TypeOrmModuleOptions => ({
	type: "postgres",
	url: configService.get<string>("DATABASE_URL"),
	autoLoadEntities: true,
	synchronize: false,
	ssl: {
		rejectUnauthorized: false,
	},
	extra: {
		timezone: "UTC",
	},
});

export default getDatabaseConfig;
