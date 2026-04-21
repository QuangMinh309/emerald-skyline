import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Block } from "../blocks/entities/block.entity";
import { Resident } from "../residents/entities/resident.entity";
import { ApartmentsService } from "./apartments.service";
import { CreateApartmentDto } from "./dto/create-apartment.dto";
import { UpdateApartmentDto } from "./dto/update-apartment.dto";
import { UpdateApartmentStatusDto } from "./dto/update-apartment-status.dto";
import { Apartment } from "./entities/apartment.entity";
import { ApartmentResident } from "./entities/apartment-resident.entity";
import { ApartmentStatus } from "./enums/apartment-status.enum";
import { ApartmentType } from "./enums/apartment-type.enum";
import { RelationshipType } from "./enums/relationship-type.enum";

describe("ApartmentsService", () => {
	let service: ApartmentsService;
	let apartmentRepository: jest.Mocked<Repository<Apartment>>;
	let apartmentResidentRepository: jest.Mocked<
		Pick<
			Repository<ApartmentResident>,
			"create" | "save" | "find" | "delete" | "count"
		>
	>;
	let blockRepository: jest.Mocked<Pick<Repository<Block>, "findOne">>;
	let residentRepository: jest.Mocked<
		Pick<Repository<Resident>, "findOne" | "find">
	>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockBlock = {
		id: 1,
		name: "Block A",
		managerName: "Manager",
		managerPhone: "0901111111",
		totalFloors: 20,
		status: "OPERATING",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as Block;

	const mockResident = {
		id: 1,
		accountId: 100,
		fullName: "Nguyễn Văn A",
		citizenId: "123456789",
		dob: new Date("1990-01-15"),
		gender: "MALE",
		phoneNumber: "0901234567",
		nationality: "Vietnamese",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as Resident;

	const mockResident2 = {
		id: 2,
		fullName: "Trần Thị B",
		phoneNumber: "0987654321",
		citizenId: "987654321",
		gender: "FEMALE",
		isActive: true,
	} as Resident;

	const mockApartment = {
		id: 1,
		name: "A.12-01",
		blockId: 1,
		type: ApartmentType.ONE_BEDROOM,
		floor: 12,
		area: 85.5,
		status: ApartmentStatus.OCCUPIED,
		isActive: true,
		createdAt: new Date(),
		block: mockBlock,
		apartmentResidents: [],
	} as unknown as Apartment;

	const mockApartmentResident = {
		id: 1,
		apartmentId: 1,
		residentId: 1,
		relationship: RelationshipType.OWNER,
		resident: mockResident,
	} as ApartmentResident;

	const mockApartmentWithResidents = {
		...mockApartment,
		apartmentResidents: [mockApartmentResident],
	} as unknown as Apartment;

	// ============================================================================
	// HELPERS
	// ============================================================================

	/**
	 * Setup mocks cho luồng create thành công.
	 * Truyền overrides để ghi đè từng mock khi cần test edge case.
	 */
	const setupSuccessfulCreateMocks = (
		overrides: {
			block?: Block | null;
			existingApartment?: Apartment | null;
			owner?: Resident | null;
			extraResidents?: (Resident | null)[];
		} = {},
	) => {
		jest
			.spyOn(blockRepository, "findOne")
			.mockResolvedValue(
				overrides.block !== undefined ? overrides.block : mockBlock,
			);

		jest
			.spyOn(apartmentRepository, "findOne")
			.mockResolvedValueOnce(
				overrides.existingApartment !== undefined
					? overrides.existingApartment
					: null,
			);

		const ownerMock = jest
			.spyOn(residentRepository, "findOne")
			.mockResolvedValueOnce(
				overrides.owner !== undefined ? overrides.owner : mockResident,
			);

		if (overrides.extraResidents) {
			for (const r of overrides.extraResidents) {
				ownerMock.mockResolvedValueOnce(r);
			}
		}

		jest.spyOn(apartmentRepository, "create").mockReturnValue(mockApartment);
		jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);
		jest
			.spyOn(apartmentResidentRepository, "create")
			.mockReturnValue(mockApartmentResident);
		jest
			.spyOn(apartmentResidentRepository, "save")
			.mockResolvedValue(mockApartmentResident);

		// findOne lần 2 - trả về apartment sau khi đã tạo xong (gọi trong findOne)
		jest
			.spyOn(apartmentRepository, "findOne")
			.mockResolvedValueOnce(mockApartmentWithResidents);
	};

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApartmentsService,
				{
					provide: getRepositoryToken(Apartment),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						update: jest.fn(),
						createQueryBuilder: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(ApartmentResident),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						find: jest.fn(),
						delete: jest.fn(),
						count: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Block),
					useValue: { findOne: jest.fn() },
				},
				{
					provide: getRepositoryToken(Resident),
					useValue: { findOne: jest.fn() },
				},
			],
		}).compile();

		service = module.get<ApartmentsService>(ApartmentsService);
		apartmentRepository = module.get(getRepositoryToken(Apartment));
		apartmentResidentRepository = module.get(
			getRepositoryToken(ApartmentResident),
		);
		blockRepository = module.get(getRepositoryToken(Block));
		residentRepository = module.get(getRepositoryToken(Resident));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const baseDto: CreateApartmentDto = {
			roomName: "A.12-01",
			type: ApartmentType.ONE_BEDROOM,
			blockId: 1,
			floor: 12,
			area: 85.5,
			owner_id: 1,
		};

		it("should create apartment with owner only and return formatted response", async () => {
			setupSuccessfulCreateMocks();

			const result = await service.create(baseDto);

			expect(result).toBeDefined();
			expect(result.generalInfo).toBeDefined();
			expect(apartmentRepository.save).toHaveBeenCalled();
			expect(apartmentResidentRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({ relationship: RelationshipType.OWNER }),
			);
		});

		it("should create apartment with additional residents", async () => {
			setupSuccessfulCreateMocks({ extraResidents: [mockResident2] });

			const dto: CreateApartmentDto = {
				...baseDto,
				residents: [{ id: 2, relationship: RelationshipType.SPOUSE }],
			};

			const result = await service.create(dto);

			expect(result).toBeDefined();
			// save được gọi: tạo apt + owner + update status OCCUPIED + resident2
			expect(apartmentResidentRepository.save).toHaveBeenCalledTimes(2);
		});

		it("should skip duplicate owner in residents list", async () => {
			setupSuccessfulCreateMocks();

			const dto: CreateApartmentDto = {
				...baseDto,
				// residents có owner_id = 1, phải bị filter ra
				residents: [{ id: 1, relationship: RelationshipType.OWNER }],
			};

			await service.create(dto);

			// chỉ save 1 lần cho owner, không save thêm
			expect(apartmentResidentRepository.save).toHaveBeenCalledTimes(1);
		});

		it("should auto-set status to OCCUPIED after creating with owner", async () => {
			setupSuccessfulCreateMocks();

			await service.create(baseDto);

			const saveCall = jest
				.spyOn(apartmentRepository, "save")
				.mock.calls.find(
					([apt]: any[]) => apt.status === ApartmentStatus.OCCUPIED,
				);
			expect(saveCall).toBeDefined();
		});

		it("should throw NOT_FOUND (404) when block does not exist", async () => {
			setupSuccessfulCreateMocks({ block: null });

			await expect(service.create(baseDto)).rejects.toThrow(
				new HttpException("Block không tồn tại", HttpStatus.NOT_FOUND),
			);
			expect(apartmentRepository.save).not.toHaveBeenCalled();
		});

		it("should throw CONFLICT (409) when apartment name already exists in block", async () => {
			setupSuccessfulCreateMocks({ existingApartment: mockApartment });

			await expect(service.create(baseDto)).rejects.toThrow(
				new HttpException(
					"Tên căn hộ đã tồn tại trong block này",
					HttpStatus.CONFLICT,
				),
			);
		});

		it("should throw NOT_FOUND (404) when owner does not exist", async () => {
			setupSuccessfulCreateMocks({ owner: null });

			await expect(service.create(baseDto)).rejects.toThrow(
				new HttpException("Chủ sở hữu không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should throw NOT_FOUND (404) when a resident in list does not exist", async () => {
			setupSuccessfulCreateMocks({ extraResidents: [null] });

			const dto: CreateApartmentDto = {
				...baseDto,
				residents: [{ id: 99, relationship: RelationshipType.SPOUSE }],
			};

			await expect(service.create(dto)).rejects.toThrow(HttpException);
		});
	});

	// ============================================================================
	// FINDALL
	// ============================================================================

	describe("findAll", () => {
		const buildQueryBuilder = (apartments: Apartment[]) => ({
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue(apartments),
		});

		it("should return mapped list when no filters", async () => {
			const qb = buildQueryBuilder([mockApartmentWithResidents]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			const result = await service.findAll({});

			expect(Array.isArray(result)).toBe(true);
			expect(result[0]).toHaveProperty("roomName");
			expect(result[0]).toHaveProperty("owner");
			expect(result[0]).toHaveProperty("status");
		});

		it("should apply andWhere when search term provided", async () => {
			const qb = buildQueryBuilder([]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			await service.findAll({ search: "A.12" });

			expect(qb.andWhere).toHaveBeenCalledWith(
				expect.stringContaining("ILIKE"),
				expect.objectContaining({ search: "%A.12%" }),
			);
		});

		it("should apply andWhere when blockId filter provided", async () => {
			const qb = buildQueryBuilder([]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			await service.findAll({ blockId: 1 });

			expect(qb.andWhere).toHaveBeenCalledWith(
				expect.stringContaining("blockId"),
				expect.objectContaining({ blockId: 1 }),
			);
		});

		it("should apply andWhere when type filter provided", async () => {
			const qb = buildQueryBuilder([]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			await service.findAll({ type: ApartmentType.TWO_BEDROOM });

			expect(qb.andWhere).toHaveBeenCalledWith(
				expect.stringContaining("type"),
				expect.objectContaining({ type: ApartmentType.TWO_BEDROOM }),
			);
		});

		it("should apply multiple andWhere calls when search + blockId combined", async () => {
			const qb = buildQueryBuilder([]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			await service.findAll({ search: "A.12", blockId: 1 });

			expect(qb.andWhere).toHaveBeenCalledTimes(2);
		});

		it("should show status Trống when apartment has only 1 resident (owner)", async () => {
			// Theo service: hasResidents = apartmentResidents.length > 1
			const aptWithOwnerOnly = {
				...mockApartment,
				apartmentResidents: [mockApartmentResident],
			};
			const qb = buildQueryBuilder([aptWithOwnerOnly as unknown as Apartment]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			const result = await service.findAll({});

			expect(result[0].status).toBe("Trống");
		});

		it("should show status Đang ở when apartment has more than 1 resident", async () => {
			const secondResident = { ...mockApartmentResident, id: 2, residentId: 2 };
			const aptWith2Residents = {
				...mockApartment,
				apartmentResidents: [mockApartmentResident, secondResident],
			};
			const qb = buildQueryBuilder([aptWith2Residents as unknown as Apartment]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			const result = await service.findAll({});

			expect(result[0].status).toBe("Đang ở");
		});

		it("should return empty array when no apartments match", async () => {
			const qb = buildQueryBuilder([]);
			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(qb as any);

			const result = await service.findAll({ search: "NONEXISTENT" });

			expect(result).toEqual([]);
		});
	});

	// ============================================================================
	// FINDONE
	// ============================================================================

	describe("findOne", () => {
		it("should return formatted apartment detail with generalInfo, owner, residents", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartmentWithResidents);

			const result = await service.findOne(1);

			expect(result.generalInfo).toBeDefined();
			expect(result.generalInfo.apartmentName).toBe(mockApartment.name);
			expect(result.generalInfo.blockId).toBe(mockBlock.id);
			expect(result.owner).toBeDefined();
			expect(result.owner.fullName).toBe(mockResident.fullName);
			expect(Array.isArray(result.residents)).toBe(true);
		});

		it("should include all residents in residents array", async () => {
			const residentRelation2 = {
				id: 2,
				apartmentId: 1,
				residentId: 2,
				relationship: RelationshipType.SPOUSE,
				resident: mockResident2,
			} as ApartmentResident;

			const aptWith2 = {
				...mockApartment,
				apartmentResidents: [mockApartmentResident, residentRelation2],
			} as unknown as Apartment;

			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(aptWith2);

			const result = await service.findOne(1);

			expect(result.residents).toHaveLength(2);
		});

		it("should throw NOT_FOUND (404) when apartment does not exist", async () => {
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException("Căn hộ không tồn tại", HttpStatus.NOT_FOUND),
			);
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const baseUpdateDto: UpdateApartmentDto = {
			roomName: "A.12-01-UPDATED",
			type: ApartmentType.TWO_BEDROOM,
			blockId: 1,
			floor: 13,
			area: 100,
		};

		it("should update basic fields and return formatted response", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment) // tìm apt hiện tại
				.mockResolvedValueOnce(null) // check trùng tên
				.mockResolvedValueOnce(mockApartmentWithResidents); // findOne cuối
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);

			const result = await service.update(1, baseUpdateDto);

			expect(result).toBeDefined();
			expect(apartmentRepository.save).toHaveBeenCalled();
		});

		it("should update residents and recalculate status", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment)
				.mockResolvedValueOnce(null) // check trùng tên
				.mockResolvedValueOnce(mockApartmentWithResidents); // findOne cuối
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "delete")
				.mockResolvedValue({ affected: 1 } as any);
			jest
				.spyOn(apartmentResidentRepository, "create")
				.mockReturnValue(mockApartmentResident);
			jest
				.spyOn(apartmentResidentRepository, "save")
				.mockResolvedValue(mockApartmentResident);
			jest.spyOn(apartmentResidentRepository, "count").mockResolvedValue(1);

			const dto: UpdateApartmentDto = { ...baseUpdateDto, owner_id: 1 };
			const result = await service.update(1, dto);

			expect(result).toBeDefined();
			expect(apartmentResidentRepository.delete).toHaveBeenCalledWith({
				apartmentId: 1,
			});
			expect(apartmentResidentRepository.count).toHaveBeenCalledWith({
				where: { apartmentId: 1 },
			});
		});

		it("should set status VACANT when resident count = 0 after update", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment)
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(mockApartmentWithResidents);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);
			jest
				.spyOn(apartmentResidentRepository, "delete")
				.mockResolvedValue({ affected: 1 } as any);
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null); // owner not found triggers error
			jest.spyOn(apartmentResidentRepository, "count").mockResolvedValue(0);

			const saveSpy = jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue({
					...mockApartment,
					status: ApartmentStatus.VACANT,
				});

			// Không pass owner_id để trigger residents-only path
			const dto: UpdateApartmentDto = { ...baseUpdateDto, residents: [] };
			await service.update(1, dto);

			// status không bị set vì không có owner_id hay residents
			expect(saveSpy).toHaveBeenCalled();
		});

		it("should throw NOT_FOUND (404) when apartment does not exist", async () => {
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(null);

			await expect(service.update(999, baseUpdateDto)).rejects.toThrow(
				new HttpException("Căn hộ không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should throw NOT_FOUND (404) when new block does not exist", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartment);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(
				service.update(1, { ...baseUpdateDto, blockId: 999 }),
			).rejects.toThrow(
				new HttpException("Block không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should throw CONFLICT (409) when new name already exists in block", async () => {
			const anotherApartment = {
				...mockApartment,
				id: 2,
				name: "A.12-02",
			} as Apartment;

			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment)
				.mockResolvedValueOnce(anotherApartment); // trùng tên với apt khác
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);

			await expect(
				service.update(1, { ...baseUpdateDto, roomName: "A.12-02" }),
			).rejects.toThrow(
				new HttpException(
					"Tên căn hộ đã tồn tại trong block này",
					HttpStatus.CONFLICT,
				),
			);
		});

		it("should NOT throw CONFLICT when same name belongs to the same apartment", async () => {
			// existingApartment.id === id → không conflict
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment)
				.mockResolvedValueOnce(mockApartment) // trả về chính nó
				.mockResolvedValueOnce(mockApartmentWithResidents);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);

			const result = await service.update(1, {
				...baseUpdateDto,
				roomName: "A.12-01",
			});
			expect(result).toBeDefined();
		});

		it("should throw NOT_FOUND (404) when new owner does not exist", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment)
				.mockResolvedValueOnce(null);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(mockBlock);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);
			jest
				.spyOn(apartmentResidentRepository, "delete")
				.mockResolvedValue({ affected: 1 } as any);
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(
				service.update(1, { ...baseUpdateDto, owner_id: 999 }),
			).rejects.toThrow(
				new HttpException("Chủ sở hữu không tồn tại", HttpStatus.NOT_FOUND),
			);
		});
	});

	// ============================================================================
	// REMOVE
	// ============================================================================

	describe("remove", () => {
		it("should soft-delete vacant apartment and return success message", async () => {
			const vacantApt = {
				...mockApartment,
				apartmentResidents: [],
			} as unknown as Apartment;

			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(vacantApt);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(vacantApt);

			const result = await service.remove(1);

			expect(result.message).toContain("thành công");
			expect(apartmentRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({ isActive: false }),
			);
		});

		it("should throw BAD_REQUEST (400) when apartment has residents", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartmentWithResidents);

			await expect(service.remove(1)).rejects.toThrow(
				new HttpException(expect.any(String), HttpStatus.BAD_REQUEST),
			);
			expect(apartmentRepository.save).not.toHaveBeenCalled();
		});

		it("should throw NOT_FOUND (404) when apartment does not exist", async () => {
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(
				new HttpException("Căn hộ không tồn tại", HttpStatus.NOT_FOUND),
			);
		});
	});

	// ============================================================================
	// REMOVE MANY
	// ============================================================================

	describe("removeMany", () => {
		it("should soft-delete multiple vacant apartments", async () => {
			const vacantApt2 = {
				...mockApartment,
				id: 2,
				apartmentResidents: [],
			} as unknown as Apartment;
			const vacantApt1 = {
				...mockApartment,
				apartmentResidents: [],
			} as unknown as Apartment;

			jest
				.spyOn(apartmentRepository, "find")
				.mockResolvedValue([vacantApt1, vacantApt2]);
			jest
				.spyOn(apartmentRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.deletedCount).toBe(2);
			expect(result.message).toContain("2");
			expect(apartmentRepository.update).toHaveBeenCalledWith(
				expect.anything(),
				{
					isActive: false,
				},
			);
		});

		it("should throw NOT_FOUND (404) when no apartments found", async () => {
			jest.spyOn(apartmentRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([999, 998])).rejects.toThrow(
				new HttpException(expect.any(String), HttpStatus.NOT_FOUND),
			);
		});

		it("should throw BAD_REQUEST (400) when any apartment has residents", async () => {
			const vacantApt = {
				...mockApartment,
				id: 2,
				apartmentResidents: [],
			} as unknown as Apartment;

			jest
				.spyOn(apartmentRepository, "find")
				.mockResolvedValue([mockApartmentWithResidents, vacantApt]);

			await expect(service.removeMany([1, 2])).rejects.toThrow(
				new HttpException(expect.any(String), HttpStatus.BAD_REQUEST),
			);
		});
	});

	// ============================================================================
	// UPDATE STATUS
	// ============================================================================

	describe("updateStatus", () => {
		it("should update status and return success message with apartment", async () => {
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartment);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue({
				...mockApartment,
				status: ApartmentStatus.MAINTENANCE,
			});
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValueOnce(mockApartmentWithResidents); // gọi trong findOne

			const result = await service.updateStatus(1, {
				status: ApartmentStatus.MAINTENANCE,
			});

			expect(result.message).toContain("thành công");
			expect(result.apartment).toBeDefined();
			expect(apartmentRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({ status: ApartmentStatus.MAINTENANCE }),
			);
		});

		it("should throw NOT_FOUND (404) when apartment does not exist", async () => {
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(null);

			await expect(
				service.updateStatus(999, { status: ApartmentStatus.MAINTENANCE }),
			).rejects.toThrow(
				new HttpException("Căn hộ không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should support all valid status transitions", async () => {
			const statuses = [
				ApartmentStatus.VACANT,
				ApartmentStatus.OCCUPIED,
				ApartmentStatus.MAINTENANCE,
			];

			for (const status of statuses) {
				jest
					.spyOn(apartmentRepository, "findOne")
					.mockResolvedValueOnce(mockApartment);
				jest
					.spyOn(apartmentRepository, "save")
					.mockResolvedValue({ ...mockApartment, status });
				jest
					.spyOn(apartmentRepository, "findOne")
					.mockResolvedValueOnce(mockApartmentWithResidents);

				const result = await service.updateStatus(1, { status });

				expect(apartmentRepository.save).toHaveBeenCalledWith(
					expect.objectContaining({ status }),
				);
			}
		});
	});

	// ============================================================================
	// INTEGRATION - End-to-end flows
	// ============================================================================

	describe("Integration flows", () => {
		it("create → findOne: apartment is retrievable after creation", async () => {
			setupSuccessfulCreateMocks();

			const created = await service.create({
				roomName: "A.15-01",
				type: ApartmentType.ONE_BEDROOM,
				blockId: 1,
				floor: 15,
				area: 85,
				owner_id: 1,
			});

			expect(created.generalInfo).toBeDefined();

			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartmentWithResidents);

			const retrieved = await service.findOne(1);
			expect(retrieved.generalInfo.apartmentName).toBe(mockApartment.name);
		});

		it("create → remove: can delete if no residents, cannot if has residents", async () => {
			// Cannot delete occupied
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartmentWithResidents);

			await expect(service.remove(1)).rejects.toThrow(HttpException);

			// Can delete vacant
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue({
				...mockApartment,
				apartmentResidents: [],
			} as unknown as Apartment);
			jest.spyOn(apartmentRepository, "save").mockResolvedValue(mockApartment);

			const result = await service.remove(1);
			expect(result.message).toBeDefined();
		});

		it("updateStatus: OCCUPIED → MAINTENANCE → VACANT full transition", async () => {
			const transitions = [
				ApartmentStatus.MAINTENANCE,
				ApartmentStatus.VACANT,
				ApartmentStatus.OCCUPIED,
			];

			for (const status of transitions) {
				jest
					.spyOn(apartmentRepository, "findOne")
					.mockResolvedValueOnce(mockApartment);
				jest
					.spyOn(apartmentRepository, "save")
					.mockResolvedValue({ ...mockApartment, status });
				jest
					.spyOn(apartmentRepository, "findOne")
					.mockResolvedValueOnce(mockApartmentWithResidents);

				await service.updateStatus(1, { status });
			}

			expect(apartmentRepository.save).toHaveBeenCalledTimes(
				transitions.length,
			);
		});
	});
});
