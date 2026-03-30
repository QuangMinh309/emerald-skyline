import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AccountsModule } from "../accounts/accounts.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";

@Module({
	imports: [
		AccountsModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const secret = configService.get<string>("JWT_SECRET");
				if (!secret) {
					throw new Error("JWT_SECRET is not defined in environment variables");
				}
				return {
					secret,
					signOptions: {
						expiresIn: (configService.get<string>("JWT_EXPIRATION") ||
							"120m") as any,
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
	exports: [AuthService],
})
export class AuthModule {}
