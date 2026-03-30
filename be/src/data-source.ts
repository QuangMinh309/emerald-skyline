import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

export default new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL,
	entities: ["src/**/*.entity.ts"],
	migrations: ["src/migrations/*.ts"],
	synchronize: false, // để dùng migrations
	ssl: {
		rejectUnauthorized: false,
	},
	extra: {
		timezone: "UTC",
	},
});
