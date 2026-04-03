import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";
import { CCCDResponseDto } from "./dtos/cccd-response.dto";
import { OcrResponseDto } from "./dtos/ocr-response.dto";
import { SummarizeResponseDto } from "./dtos/summarize-response.dto";

@Injectable()
export class AiService {
	private readonly aiServiceUrl: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.aiServiceUrl =
			this.configService.get<string>("AI_SERVICE_URL") ??
			"http://localhost:8000";
	}

	private createFormData(file?: Express.Multer.File, text?: string): FormData {
		const formData = new FormData();

		if (file) {
			const blob = new Blob([new Uint8Array(file.buffer)], {
				type: file.mimetype,
			});
			formData.append("file", blob, file.originalname);
		}

		if (text) {
			formData.append("text", text);
		}

		return formData;
	}

	private validateImage(file: Express.Multer.File) {
		if (!file) {
			throw new HttpException(
				"Vui lòng upload file ảnh",
				HttpStatus.BAD_REQUEST,
			);
		}

		const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
		const mimetype = file.mimetype?.toLowerCase();

		if (!validMimeTypes.includes(mimetype)) {
			throw new HttpException(
				`Chỉ chấp nhận file ảnh (jpg, png). Nhận được: ${file.mimetype}`,
				HttpStatus.BAD_REQUEST,
			);
		}

		if (file.size === 0) {
			throw new HttpException(
				"File ảnh rỗng hoặc bị lỗi",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	private handleError(error: unknown): never {
		// Axios error
		if (error instanceof AxiosError) {
			if (error.response) {
				throw new HttpException(
					error.response.data?.detail || "Lỗi từ AI Service",
					error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}

			if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
				throw new HttpException(
					"Không thể kết nối tới AI Service",
					HttpStatus.SERVICE_UNAVAILABLE,
				);
			}

			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// Native Error
		if (error instanceof Error) {
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// Unknown
		throw new HttpException("Unknown error", HttpStatus.INTERNAL_SERVER_ERROR);
	}

	async summarize(
		file?: Express.Multer.File,
		text?: string,
	): Promise<SummarizeResponseDto> {
		try {
			if (!file && !text) {
				throw new HttpException(
					"Vui lòng cung cấp file hoặc text",
					HttpStatus.BAD_REQUEST,
				);
			}

			const response = await firstValueFrom(
				this.httpService.post<SummarizeResponseDto>(
					`${this.aiServiceUrl}/api/v1/ai/summarize`,
					this.createFormData(file, text),
				),
			);

			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	async readMeter(file: Express.Multer.File): Promise<OcrResponseDto> {
		try {
			this.validateImage(file);

			const response = await firstValueFrom(
				this.httpService.post<OcrResponseDto>(
					`${this.aiServiceUrl}/api/v1/ocr/read-meter`,
					this.createFormData(file),
				),
			);

			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	async readCccdImage(file: Express.Multer.File): Promise<CCCDResponseDto> {
		try {
			this.validateImage(file);

			const response = await firstValueFrom(
				this.httpService.post<CCCDResponseDto>(
					`${this.aiServiceUrl}/api/v1/ocr/read-cccd`,
					this.createFormData(file),
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
						timeout: 30000,
					},
				),
			);

			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}
}
