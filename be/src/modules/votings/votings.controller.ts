import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { ApiDoc } from "../../decorators/api-doc.decorator";
import { Roles } from "../../decorators/role.decorator";
import { CurrentUser } from "../../decorators/user.decorator";
import { AuthGuard } from "../../guards/auth.guard";
import { RolesGuard } from "../../guards/roles.guard";
import { TransformInterceptor } from "../../interceptors/transform.interceptor";
import { UserRole } from "../accounts/enums/user-role.enum";
import { CreateVotingDto } from "./dto/create-voting.dto";
import { DeleteManyVotingsDto } from "./dto/delete-many-votings.dto";
import { QueryVotingDto } from "./dto/query-voting.dto";
import { UpdateVotingDto } from "./dto/update-voting.dto";
import { VoteDto } from "./dto/vote.dto";
import { VotingDetailResponseDto } from "./dto/voting-detail-response.dto";
import { VotingListResponseDto } from "./dto/voting-list-response.dto";
import { VotingMyVotingResponseDto } from "./dto/voting-my-voting-response.dto";
import { VotingStatisticsResponseDto } from "./dto/voting-statistics-response.dto";
import { VotingsService } from "./votings.service";

@ApiTags("Votings")
@Controller("votings")
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class VotingsController {
	constructor(private readonly votingsService: VotingsService) {}

	@Post()
	@Roles(UserRole.ADMIN)
	@UseInterceptors(
		FilesInterceptor("files", 10, {
			limits: {
				fileSize: 50 * 1024 * 1024, // 50MB per file
			},
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiDoc({
		summary: "Tạo cuộc bỏ phiếu mới",
		description:
			"Admin tạo cuộc bỏ phiếu với tiêu đề, nội dung, phạm vi, thời gian, các lựa chọn và file đính kèm",
	})
	async create(
		@Body() createVotingDto: CreateVotingDto,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		const voting = await this.votingsService.create(createVotingDto, files);
		return plainToInstance(VotingDetailResponseDto, voting);
	}

	@Get()
	@Roles(UserRole.ADMIN, UserRole.RESIDENT)
	@ApiDoc({
		summary: "Lấy danh sách tất cả cuộc bỏ phiếu (Admin)",
		description:
			"Admin xem danh sách voting với trạng thái, phạm vi và lựa chọn dẫn đầu",
	})
	async findAll(@Query() queryDto: QueryVotingDto) {
		const votings = await this.votingsService.findAll(queryDto);
		return votings.map((v) => plainToInstance(VotingListResponseDto, v));
	}

	@Get("my")
	@Roles(UserRole.RESIDENT)
	@ApiDoc({
		summary: "Lấy danh sách bỏ phiếu của resident",
		description:
			"Resident xem các cuộc bỏ phiếu áp dụng cho họ, diện tích bỏ phiếu và lựa chọn đã vote",
	})
	async findMyVotings(
		@CurrentUser("id") accountId: number,
		@Query() queryDto: QueryVotingDto,
	) {
		const votings = await this.votingsService.findMyVotings(
			accountId,
			queryDto,
		);
		return votings.map((v) => plainToInstance(VotingMyVotingResponseDto, v));
	}

	@Get(":id")
	@Roles(UserRole.ADMIN, UserRole.RESIDENT)
	@ApiDoc({
		summary: "Lấy chi tiết cuộc bỏ phiếu",
		description:
			"Xem thông tin đầy đủ về một cuộc bỏ phiếu bao gồm các lựa chọn và target blocks",
	})
	async findOne(@Param("id") id: string) {
		const voting = await this.votingsService.findOne(+id);
		return plainToInstance(VotingDetailResponseDto, voting);
	}

	@Get(":id/statistics")
	@Roles(UserRole.ADMIN)
	@ApiDoc({
		summary: "Lấy kết quả thống kê bỏ phiếu",
		description:
			"Xem thống kê chi tiết về kết quả bỏ phiếu dựa trên diện tích (1m² = 1 phiếu)",
	})
	async getStatistics(@Param("id") id: string) {
		const statistics = await this.votingsService.getStatistics(+id);
		return plainToInstance(VotingStatisticsResponseDto, statistics);
	}

	@Patch(":id")
	@Roles(UserRole.ADMIN)
	@UseInterceptors(
		FilesInterceptor("files", 10, {
			limits: {
				fileSize: 50 * 1024 * 1024, // 50MB per file
			},
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiDoc({
		summary: "Cập nhật cuộc bỏ phiếu",
		description:
			"Admin cập nhật voting. Chỉ cho phép sửa text/file khi ONGOING, không thể sửa khi ENDED",
	})
	async update(
		@Param("id") id: string,
		@Body() updateVotingDto: UpdateVotingDto,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		const voting = await this.votingsService.update(
			+id,
			updateVotingDto,
			files,
		);
		return plainToInstance(VotingDetailResponseDto, voting);
	}

	@Delete(":id")
	@Roles(UserRole.ADMIN)
	@ApiDoc({
		summary: "Xóa mềm một cuộc bỏ phiếu",
		description: "Admin xóa mềm voting bằng cách set isActive = false",
	})
	async remove(@Param("id") id: string) {
		return this.votingsService.remove(+id);
	}

	@Delete("batch/delete")
	@Roles(UserRole.ADMIN)
	@ApiDoc({
		summary: "Xóa mềm nhiều cuộc bỏ phiếu",
		description: "Admin xóa mềm nhiều voting cùng lúc",
	})
	async removeMany(@Body() deleteDto: DeleteManyVotingsDto) {
		return this.votingsService.removeMany(deleteDto);
	}

	@Post(":id/vote")
	@Roles(UserRole.RESIDENT)
	@ApiDoc({
		summary: "Resident bỏ phiếu",
		description:
			"Resident vote cho một lựa chọn. Phiếu bầu có trọng số dựa trên diện tích căn hộ sở hữu",
	})
	async vote(
		@CurrentUser("id") accountId: number,
		@Param("id") votingId: string,
		@Body() voteDto: VoteDto,
	) {
		return this.votingsService.vote(accountId, +votingId, voteDto);
	}
}
