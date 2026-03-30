import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				url: configService.get<string>("DATABASE_URL"),
				autoLoadEntities: true,
				synchronize: true, // Bật true ở giai đoạn DEV để nó tự tạo bảng, khi lên PROD sẽ tắt
				ssl: {
					rejectUnauthorized: false,
				},
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}
