import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseDto } from "src/dtos/response.dto";

interface RequestWithTimer extends Request {
	startTime?: number;
}

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, ResponseDto<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<ResponseDto<T>> {
		const ctx = context.switchToHttp();
		const response: Response = ctx.getResponse(); // response của Express
		const request: Request = ctx.getRequest();
		const startTime = Number((request as RequestWithTimer).startTime);
		const endTime = Date.now();
		const takenTime = `${endTime - startTime}ms`;
		return next
			.handle()
			.pipe(
				map(
					(data) =>
						new ResponseDto(
							response.statusCode,
							"success",
							takenTime,
							request,
							data as T,
						),
				),
			);
	}
}
