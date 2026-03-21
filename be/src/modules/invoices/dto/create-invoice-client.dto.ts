/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateInvoiceClientDto {
	@ApiProperty({
		example: 1,
		description: "ID của căn hộ cử dân muốn tạo hóa đơn",
	})
	@Transform(({ value }) => {
		const num = Number(value);
		return isNaN(num) ? value : num;
	})
	@IsNumber()
	@IsNotEmpty()
	@Type(() => Number)
	apartmentId: number;

	@ApiProperty({
		example: 100,
		description: "Chỉ số nước mới",
	})
	@Transform(({ value }) => {
		const num = Number(value);
		return isNaN(num) ? value : num;
	})
	@IsNumber()
	@IsNotEmpty()
	@Type(() => Number)
	waterIndex: number;

	@ApiProperty({
		example: 200,
		description: "Chỉ số điện mới",
	})
	@Transform(({ value }) => {
		const num = Number(value);
		return isNaN(num) ? value : num;
	})
	@IsNumber()
	@IsNotEmpty()
	@Type(() => Number)
	electricityIndex: number;

	// @ApiProperty({
	//   example: '2024-01-05T10:15:30Z',
	//   description: 'Kỳ thanh toán',
	// })
	// @IsDateString()
	// @IsNotEmpty()
	// period: string;
}
