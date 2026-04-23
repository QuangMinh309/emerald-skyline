import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Apartment } from "../apartments/entities/apartment.entity";
import { ApartmentType } from "../apartments/enums/apartment-type.enum";
import { BlocksService } from "./blocks.service";
import { CreateBlockDto } from "./dto/create-block.dto";
import { CreateBlockApartmentDto } from "./dto/create-block-apartment.dto";
import { UpdateBlockDto } from "./dto/update-block.dto";
import { Block } from "./entities/block.entity";
import { BlockStatus } from "./enums/block-status.enum";

describe("BlocksService", () => {
	let service: BlocksService;
	let blockRepository: jest.Mocked<Repository<Block>>;
	let apartmentRepository: jest.Mocked<Repository<Apartment>>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockBlock = {
		id: 1,
		name: "Block A",
		managerName: "John Doe",
		managerPhone: "0912345678",
		totalFloors: 10,
		status: BlockStatus.OPERATING,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		apartments: [],
	} as unknown as Block;

	const mockBlock2 = {
		id: 2,
		name: "Block B",
		managerName: "Jane Smith",
		managerPhone: "0987654321",
		totalFloors: 8,
		status: BlockStatus.UNDER_MAINTENANCE,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		apartments: [],
	} as unknown as Block;

	const mockApartment = {
		id: 1,
		name: "A101",
		blockId: 1,
		floor: 1,
		type: ApartmentType.ONE_BEDROOM,
		area: 75,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		apartmentResidents: [],
	} as unknown as Apartment;

	const mockApartment2 = {
		id: 2,
		name: "A102",
		blockId: 1,
		floor: 1,
		type: ApartmentType.TWO_BEDROOM,
		area: 100,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		apartmentResidents: [],
	} as unknown as Apartment;

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BlocksService,
				{
					provide: getRepositoryToken(Block),
					useValue: {
						findOne: jest.fn(),
						find: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
						count: jest.fn(),
						createQueryBuilder: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Apartment),
					useValue: {
						findOne: jest.fn(),
						find: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
						count: jest.fn(),
						createQueryBuilder: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<BlocksService>(BlocksService);
		blockRepository = module.get(getRepositoryToken(Block));
		apartmentRepository = module.get(getRepositoryToken(Apartment));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const createDto: CreateBlockDto = {
			buildingName: "Block C",
			managerName: "Manager Name",
			managerPhone: "0912345678",
			apartments: [],
		};

		it("should create block successfully without apartments", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const result = await service.create(createDto);

			expect(blockRepository.findOne).toHaveBeenCalledWith({
				where: { name: createDto.buildingName },
			});
			expect(result).toBeDefined();
		});

		it("should throw CONFLICT if block name already exists", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException("Tên block đã tồn tại", HttpStatus.CONFLICT),
			);

			expect(blockRepository.create).not.toHaveBeenCalled();
		});

		it("should create block with apartments", async () => {
			const dtoWithApts: CreateBlockDto = {
				buildingName: "Block D",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [
					{
						roomName: "D101",
						floor: 1,
						type: ApartmentType.STUDIO,
						area: 50,
					} as CreateBlockApartmentDto,
					{
						roomName: "D102",
						floor: 2,
						type: ApartmentType.ONE_BEDROOM,
						area: 75,
					} as CreateBlockApartmentDto,
				],
			};

			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest
				.spyOn(apartmentRepository, "create")
				.mockReturnValue(mockApartment as any);
			jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue(mockApartment as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const result = await service.create(dtoWithApts);

			expect(apartmentRepository.create).toHaveBeenCalledTimes(2);
			expect(apartmentRepository.save).toHaveBeenCalledTimes(2);
			expect(result).toBeDefined();
		});

		it("should set default status to OPERATING", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue({
				...mockBlock,
				status: BlockStatus.OPERATING,
			} as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			await service.create(createDto);

			expect(blockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					status: BlockStatus.OPERATING,
				}),
			);
		});

		it("should calculate total floors from apartments", async () => {
			const dtoWithFloors: CreateBlockDto = {
				buildingName: "Block E",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [
					{
						roomName: "E101",
						floor: 1,
						type: ApartmentType.STUDIO,
						area: 50,
					} as CreateBlockApartmentDto,
					{
						roomName: "E210",
						floor: 2,
						type: ApartmentType.ONE_BEDROOM,
						area: 75,
					} as CreateBlockApartmentDto,
					{
						roomName: "E305",
						floor: 3,
						type: ApartmentType.TWO_BEDROOM,
						area: 100,
					} as CreateBlockApartmentDto,
				],
			};

			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue({
				...mockBlock,
				totalFloors: 3,
			} as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest
				.spyOn(apartmentRepository, "create")
				.mockReturnValue(mockApartment as any);
			jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue(mockApartment as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			await service.create(dtoWithFloors);

			expect(blockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					totalFloors: 3,
				}),
			);
		});

		it("should set totalFloors to 0 if no apartments provided", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			await service.create(createDto);

			expect(blockRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					totalFloors: 0,
				}),
			);
		});

		it("should map apartment DTO fields correctly", async () => {
			const dtoWithApts: CreateBlockDto = {
				buildingName: "Block F",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [
					{
						roomName: "F101",
						floor: 1,
						type: ApartmentType.STUDIO,
						area: 50,
					} as CreateBlockApartmentDto,
				],
			};

			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest
				.spyOn(apartmentRepository, "create")
				.mockReturnValue(mockApartment as any);
			jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue(mockApartment as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			await service.create(dtoWithApts);

			expect(apartmentRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "F101",
					floor: 1,
					type: ApartmentType.STUDIO,
					area: 50,
				}),
			);
		});
	});

	// ============================================================================
	// FIND ALL
	// ============================================================================

	describe("findAll", () => {
		it("should return all blocks without filters", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest
					.fn()
					.mockResolvedValue([
						{ ...mockBlock, apartments: [mockApartment] } as any,
						{ ...mockBlock2, apartments: [] } as any,
					]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result).toHaveLength(2);
			expect(result[0].buildingName).toBe("Block A");
		});

		it("should filter blocks by status", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockBlock as any]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ status: BlockStatus.OPERATING });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"block.status = :status",
				{
					status: BlockStatus.OPERATING,
				},
			);
		});

		it("should search blocks by name", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockBlock as any]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ search: "Block A" });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"block.name ILIKE :search",
				{
					search: "%Block A%",
				},
			);
		});

		it("should return room details breakdown", async () => {
			const blockWithApts = {
				...mockBlock,
				apartments: [
					{ ...mockApartment, type: ApartmentType.STUDIO } as any,
					{ ...mockApartment2, type: ApartmentType.TWO_BEDROOM } as any,
					{ ...mockApartment, type: ApartmentType.ONE_BEDROOM } as any,
				],
			};

			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([blockWithApts]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result[0].roomDetails).toBeDefined();
			expect(result[0].totalRooms).toBe(3);
		});

		it("should order blocks by createdAt DESC", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({});

			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
				"block.createdAt",
				"DESC",
			);
		});

		it("should only return active blocks", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({});

			expect(mockQueryBuilder.where).toHaveBeenCalledWith(
				"block.isActive = :isActive",
				{
					isActive: true,
				},
			);
		});
	});

	// ============================================================================
	// FIND ONE
	// ============================================================================

	describe("findOne", () => {
		it("should return active block with details", async () => {
			const blockWithApts = {
				...mockBlock,
				apartments: [mockApartment as any],
			};

			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(blockWithApts as any);

			const result = await service.findOne(1);

			expect(blockRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1, isActive: true },
				relations: ["apartments", "apartments.apartmentResidents"],
			});
			expect(result.buildingName).toBe("Block A");
			expect(result.apartments).toBeDefined();
		});

		it("should throw NOT_FOUND if block does not exist", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException(
					"Block với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should only return active apartments", async () => {
			const blockWithMixedApts = {
				...mockBlock,
				apartments: [
					{ ...mockApartment, isActive: true } as any,
					{ ...mockApartment2, isActive: false } as any,
				],
			};

			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(blockWithMixedApts as any);

			const result = await service.findOne(1);

			expect(result.apartments).toHaveLength(1);
			expect(result.apartments[0].roomName).toBe("A101");
		});

		it("should map apartment properties correctly", async () => {
			const blockWithApts = {
				...mockBlock,
				apartments: [
					{
						...mockApartment,
						apartmentResidents: [{ residentId: 1 }],
					} as any,
				],
			};

			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(blockWithApts as any);

			const result = await service.findOne(1);

			expect(result.apartments[0]).toEqual(
				expect.objectContaining({
					roomName: "A101",
					type: ApartmentType.ONE_BEDROOM,
					floor: 1,
					hasResidents: true,
				}),
			);
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const updateDto: UpdateBlockDto = {
			managerName: "New Manager",
			managerPhone: "0987654321",
		};

		it("should update block basic fields successfully", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue({
				...mockBlock,
				...updateDto,
			} as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const result = await service.update(1, updateDto);

			expect(blockRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should throw NOT_FOUND if block does not exist", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(service.update(999, updateDto)).rejects.toThrow(
				HttpException,
			);
		});

		it("should update block name if different from current", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValueOnce(mockBlock as any)
				.mockResolvedValueOnce(null);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const updateWithName: UpdateBlockDto = {
				buildingName: "Block G",
				...updateDto,
			};

			await service.update(1, updateWithName);

			expect(blockRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Block G",
				}),
			);
		});

		it("should throw CONFLICT if new name already exists", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValueOnce(mockBlock as any)
				.mockResolvedValueOnce(mockBlock2 as any);

			const updateWithExistingName: UpdateBlockDto = {
				buildingName: "Block B",
			};

			await expect(service.update(1, updateWithExistingName)).rejects.toThrow(
				new HttpException("Tên block đã tồn tại", HttpStatus.CONFLICT),
			);
		});

		it("should allow updating with same name", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockImplementation(async (query: any) => {
					// First call: find by id
					if (query.where.id) {
						return mockBlock as any;
					}
					// Second call: find by name (if different, shouldn't happen for this test)
					return null;
				});
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const updateWithSameName: UpdateBlockDto = {
				buildingName: "Block A",
			};

			const result = await service.update(1, updateWithSameName);

			expect(result).toBeDefined();
		});

		it("should update apartments and deactivate old ones", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(apartmentRepository, "update").mockResolvedValue({
				affected: 2,
			} as any);
			jest
				.spyOn(apartmentRepository, "create")
				.mockReturnValue(mockApartment as any);
			jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue(mockApartment as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const updateWithApts: UpdateBlockDto = {
				apartments: [
					{
						roomName: "A201",
						floor: 2,
						type: ApartmentType.STUDIO,
						area: 50,
					} as CreateBlockApartmentDto,
				],
			};

			await service.update(1, updateWithApts);

			expect(apartmentRepository.update).toHaveBeenCalledWith(
				{ blockId: 1 },
				{ isActive: false },
			);
		});

		it("should update status field", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue({
				...mockBlock,
				status: BlockStatus.UNDER_MAINTENANCE,
			} as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const updateWithStatus: UpdateBlockDto = {
				status: BlockStatus.UNDER_MAINTENANCE,
			};

			await service.update(1, updateWithStatus);

			expect(blockRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					status: BlockStatus.UNDER_MAINTENANCE,
				}),
			);
		});
	});

	// ============================================================================
	// REMOVE
	// ============================================================================

	describe("remove", () => {
		it("should soft delete block successfully", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(0);
			jest.spyOn(blockRepository, "save").mockResolvedValue({
				...mockBlock,
				isActive: false,
			} as any);

			const result = await service.remove(1);

			expect(result.message).toContain("Xóa block thành công");
			expect(blockRepository.save).toHaveBeenCalled();
		});

		it("should throw NOT_FOUND if block does not exist", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(HttpException);
		});

		it("should throw BAD_REQUEST if block has apartments", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(3);

			await expect(service.remove(1)).rejects.toThrow(
				new HttpException(
					"Không thể xóa block đang có 3 căn hộ",
					HttpStatus.BAD_REQUEST,
				),
			);

			expect(blockRepository.save).not.toHaveBeenCalled();
		});
	});

	// ============================================================================
	// REMOVE MANY
	// ============================================================================

	describe("removeMany", () => {
		it("should soft delete multiple blocks successfully", async () => {
			jest
				.spyOn(blockRepository, "find")
				.mockResolvedValue([mockBlock as any, mockBlock2 as any]);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(blockRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.deletedCount).toBe(2);
			expect(blockRepository.update).toHaveBeenCalledWith(
				{ id: In([1, 2]) },
				{ isActive: false },
			);
		});

		it("should throw NOT_FOUND if no active blocks found", async () => {
			jest.spyOn(blockRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([999, 1000])).rejects.toThrow(
				new HttpException(
					"Không tìm thấy block nào với các ID đã cung cấp",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should throw BAD_REQUEST if any block has apartments", async () => {
			jest
				.spyOn(blockRepository, "find")
				.mockResolvedValue([mockBlock as any, mockBlock2 as any]);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(5);

			await expect(service.removeMany([1, 2])).rejects.toThrow(
				new HttpException(
					"Không thể xóa các block đang có 5 căn hộ",
					HttpStatus.BAD_REQUEST,
				),
			);

			expect(blockRepository.update).not.toHaveBeenCalled();
		});

		it("should return deletion count message", async () => {
			jest
				.spyOn(blockRepository, "find")
				.mockResolvedValue([mockBlock as any, mockBlock2 as any]);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(blockRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.message).toContain("2");
			expect(result.message).toContain("Xóa thành công");
		});
	});

	// ============================================================================
	// HAS RESIDENTS
	// ============================================================================

	describe("hasResidents", () => {
		it("should return true if block has residents", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);

			const mockQueryBuilder = {
				innerJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				getRawOne: jest.fn().mockResolvedValue({ count: "5" }),
			};

			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.hasResidents(1);

			expect(result.hasResidents).toBe(true);
		});

		it("should return false if block has no residents", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);

			const mockQueryBuilder = {
				innerJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				getRawOne: jest.fn().mockResolvedValue({ count: "0" }),
			};

			jest
				.spyOn(apartmentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.hasResidents(1);

			expect(result.hasResidents).toBe(false);
		});

		it("should throw NOT_FOUND if block does not exist", async () => {
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(service.hasResidents(999)).rejects.toThrow(
				new HttpException("Block không tồn tại", HttpStatus.NOT_FOUND),
			);
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration: Block Lifecycle", () => {
		it("should create, update, and retrieve block", async () => {
			const createDto: CreateBlockDto = {
				buildingName: "Integration Block",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [],
			};

			// Create step
			jest.spyOn(blockRepository, "findOne").mockResolvedValueOnce(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const created = (await service.create(createDto)) as any;
			expect(created).toBeDefined();

			// Update step
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValueOnce(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue({
				...mockBlock,
				managerName: "New Manager",
			} as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const updated = (await service.update(created.id, {
				managerName: "New Manager",
			})) as any;
			expect(updated).toBeDefined();

			// Retrieve step
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);

			const retrieved = (await service.findOne(created.id)) as any;
			expect(retrieved).toBeDefined();
		});

		it("should create and delete block", async () => {
			const createDto: CreateBlockDto = {
				buildingName: "Delete Test Block",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [],
			};

			// Create step
			jest.spyOn(blockRepository, "findOne").mockResolvedValueOnce(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockBlock as any);

			const created = await service.create(createDto);

			// Delete step
			jest.clearAllMocks();
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(0);
			jest.spyOn(blockRepository, "save").mockResolvedValue({
				...mockBlock,
				isActive: false,
			} as any);

			const result = await service.remove(created.id);

			expect(result.message).toContain("Xóa block thành công");
		});

		it("should handle block with apartments lifecycle", async () => {
			const createDto: CreateBlockDto = {
				buildingName: "Block with Apts",
				managerName: "Manager",
				managerPhone: "0912345678",
				apartments: [
					{
						roomName: "A301",
						floor: 3,
						type: ApartmentType.ONE_BEDROOM,
						area: 75,
					} as CreateBlockApartmentDto,
				],
			};

			// Create
			jest.spyOn(blockRepository, "findOne").mockResolvedValueOnce(null);
			jest.spyOn(blockRepository, "create").mockReturnValue(mockBlock as any);
			jest.spyOn(blockRepository, "save").mockResolvedValue(mockBlock as any);
			jest
				.spyOn(apartmentRepository, "create")
				.mockReturnValue(mockApartment as any);
			jest
				.spyOn(apartmentRepository, "save")
				.mockResolvedValue(mockApartment as any);
			jest.spyOn(service, "findOne").mockResolvedValue({
				...mockBlock,
				apartments: [
					{
						roomName: "A301",
						floor: 3,
						type: ApartmentType.ONE_BEDROOM,
						area: 75,
						hasResidents: false,
					},
				],
			} as any);

			await service.create(createDto);

			// Try to delete - should fail because has apartments
			jest.clearAllMocks();
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(apartmentRepository, "count").mockResolvedValue(1);

			await expect(service.remove(mockBlock.id)).rejects.toThrow(HttpException);
		});
	});

	// ============================================================================
	// EDGE CASES
	// ============================================================================

	describe("Edge Cases", () => {
		it("should handle removeMany with empty array", async () => {
			jest.spyOn(blockRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([])).rejects.toThrow(HttpException);
		});

		it("should handle empty search results", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({ search: "nonexistent" });

			expect(result).toEqual([]);
		});

		it("should handle block with no apartments in findOne", async () => {
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue({ ...mockBlock, apartments: [] } as any);

			const result = await service.findOne(1);

			expect(result.apartments).toEqual([]);
			expect(result.totalRooms).toBe(0);
		});

		it("should handle all apartment types in room details", async () => {
			const blockWithAllTypes = {
				...mockBlock,
				apartments: [
					{ ...mockApartment, type: ApartmentType.STUDIO } as any,
					{ ...mockApartment2, type: ApartmentType.ONE_BEDROOM } as any,
					{ ...mockApartment, type: ApartmentType.TWO_BEDROOM } as any,
					{ ...mockApartment2, type: ApartmentType.PENTHOUSE } as any,
				],
			};

			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([blockWithAllTypes]),
			};

			jest
				.spyOn(blockRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result[0].roomDetails.studio).toBe(1);
			expect(result[0].roomDetails.oneBedroom).toBe(1);
			expect(result[0].roomDetails.twoBedroom).toBe(1);
			expect(result[0].roomDetails.penthouse).toBe(1);
		});
	});
});
