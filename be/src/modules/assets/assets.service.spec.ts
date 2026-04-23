import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { AssetType } from "../asset-types/entities/asset-type.entity";
import { Block } from "../blocks/entities/block.entity";
import { MaintenanceTicket } from "../maintenance-tickets/entities/maintenance-ticket.entity";
import { TicketStatus } from "../maintenance-tickets/enums/ticket-status.enum";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { Asset } from "./entities/asset.entity";
import { AssetStatus } from "./enums/asset-status.enum";

describe("AssetsService", () => {
	let service: AssetsService;
	let assetRepository: jest.Mocked<Repository<Asset>>;
	let assetTypeRepository: jest.Mocked<Repository<AssetType>>;
	let blockRepository: jest.Mocked<Repository<Block>>;
	let ticketRepository: jest.Mocked<Repository<MaintenanceTicket>>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockAssetType = {
		id: 1,
		name: "Air Conditioner",
		description: "AC Unit",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as AssetType;

	const mockBlock = {
		id: 1,
		name: "Block A",
		managerName: "John Doe",
		managerPhone: "0912345678",
		totalFloors: 10,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Block;

	const mockAsset = {
		id: 1,
		name: "AC Unit A101",
		typeId: 1,
		blockId: 1,
		floor: 1,
		locationDetail: "Living Room",
		status: AssetStatus.ACTIVE,
		installationDate: new Date("2024-01-20"),
		warrantyYears: 3,
		warrantyExpirationDate: new Date("2027-01-20"),
		maintenanceIntervalMonths: 6,
		nextMaintenanceDate: new Date("2024-07-20"),
		lastMaintenanceDate: null,
		description: "Main AC Unit",
		note: "Check coolant levels",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		type: mockAssetType,
		block: mockBlock,
	} as unknown as Asset;

	const mockAsset2 = {
		id: 2,
		name: "Water Pump B201",
		typeId: 2,
		blockId: 1,
		floor: 2,
		locationDetail: "Pump Room",
		status: AssetStatus.MAINTENANCE,
		installationDate: new Date("2023-06-15"),
		warrantyYears: 2,
		warrantyExpirationDate: new Date("2025-06-15"),
		maintenanceIntervalMonths: 3,
		nextMaintenanceDate: new Date("2024-06-15"),
		lastMaintenanceDate: new Date("2024-03-15"),
		description: "Building Water Pump",
		note: null,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		type: mockAssetType,
		block: mockBlock,
	} as unknown as Asset;

	const mockTicket = {
		id: 1,
		assetId: 1,
		title: "AC Maintenance",
		type: "MAINTENANCE",
		status: TicketStatus.COMPLETED,
		completedDate: new Date("2024-06-20"),
		result: "Cleaned filters",
		isActive: true,
		technician: { fullName: "Tech Name" },
	} as unknown as MaintenanceTicket;

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AssetsService,
				{
					provide: getRepositoryToken(Asset),
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
					provide: getRepositoryToken(AssetType),
					useValue: {
						findOne: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Block),
					useValue: {
						findOne: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(MaintenanceTicket),
					useValue: {
						find: jest.fn(),
						count: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AssetsService>(AssetsService);
		assetRepository = module.get(getRepositoryToken(Asset));
		assetTypeRepository = module.get(getRepositoryToken(AssetType));
		blockRepository = module.get(getRepositoryToken(Block));
		ticketRepository = module.get(getRepositoryToken(MaintenanceTicket));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const createDto: CreateAssetDto = {
			name: "New AC Unit",
			typeId: 1,
			blockId: 1,
			floor: 1,
			locationDetail: "Room A",
			installationDate: "2024-01-20",
			warrantyYears: 3,
			maintenanceIntervalMonths: 6,
			description: "Test AC",
		};

		it("should create asset successfully with valid data", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const result = await service.create(createDto);

			expect(assetTypeRepository.findOne).toHaveBeenCalled();
			expect(blockRepository.findOne).toHaveBeenCalled();
			expect(assetRepository.create).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should throw NOT_FOUND if asset type does not exist", async () => {
			jest.spyOn(assetTypeRepository, "findOne").mockResolvedValue(null);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException(
					`Asset type với ID ${createDto.typeId} không tồn tại`,
					HttpStatus.NOT_FOUND,
				),
			);

			expect(blockRepository.findOne).not.toHaveBeenCalled();
		});

		it("should throw NOT_FOUND if block does not exist", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException(
					`Block với ID ${createDto.blockId} không tồn tại`,
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should set default status to ACTIVE", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue({
				...mockAsset,
				status: AssetStatus.ACTIVE,
			} as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			await service.create(createDto);

			expect(assetRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					status: AssetStatus.ACTIVE,
				}),
			);
		});

		it("should calculate warranty expiration date from warranty years", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			await service.create(createDto);

			expect(assetRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					warrantyYears: 3,
					warrantyExpirationDate: expect.any(Date),
				}),
			);
		});

		it("should calculate next maintenance date from interval", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			await service.create(createDto);

			expect(assetRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					maintenanceIntervalMonths: 6,
					nextMaintenanceDate: expect.any(Date),
				}),
			);
		});

		it("should set default maintenance interval to 6 months if not provided", async () => {
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const dtoWithoutMaintenance: CreateAssetDto = {
				...createDto,
				maintenanceIntervalMonths: undefined,
			};

			await service.create(dtoWithoutMaintenance);

			expect(assetRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					nextMaintenanceDate: expect.any(Date),
				}),
			);
		});
	});

	// ============================================================================
	// FIND ALL
	// ============================================================================

	describe("findAll", () => {
		it("should return all assets without filters", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest
					.fn()
					.mockResolvedValue([
						{ ...mockAsset, type: mockAssetType, block: mockBlock } as any,
						{ ...mockAsset2, type: mockAssetType, block: mockBlock } as any,
					]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("AC Unit A101");
		});

		it("should filter by search", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ search: "AC Unit" });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"asset.name ILIKE :search",
				{
					search: "%AC Unit%",
				},
			);
		});

		it("should filter by blockId", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ blockId: 1 });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"asset.blockId = :blockId",
				{
					blockId: 1,
				},
			);
		});

		it("should filter by typeId", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ typeId: 1 });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"asset.typeId = :typeId",
				{
					typeId: 1,
				},
			);
		});

		it("should filter by status", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ status: AssetStatus.ACTIVE });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"asset.status = :status",
				{
					status: AssetStatus.ACTIVE,
				},
			);
		});

		it("should filter by floor", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ floor: 1 });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"asset.floor = :floor",
				{
					floor: 1,
				},
			);
		});

		it("should return warranty validity status", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([
					{
						...mockAsset,
						type: mockAssetType,
						block: mockBlock,
						warrantyExpirationDate: new Date(
							Date.now() + 1000 * 60 * 60 * 24 * 30,
						),
					} as any,
				]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result[0].isWarrantyValid).toBe(true);
		});

		it("should only return active assets", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({});

			expect(mockQueryBuilder.where).toHaveBeenCalledWith(
				"asset.isActive = :isActive",
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
		it("should return asset with detailed information", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest
				.spyOn(ticketRepository, "find")
				.mockResolvedValue([mockTicket as any]);

			const result = await service.findOne(1);

			expect(result.id).toBe(1);
			expect(result.name).toBe("AC Unit A101");
			expect(result.type).toBeDefined();
			expect(result.location).toBeDefined();
			expect(result.timeline).toBeDefined();
			expect(result.computed).toBeDefined();
		});

		it("should throw NOT_FOUND if asset does not exist", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException(
					"Asset với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should calculate warranty validity correctly", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
				warrantyExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.computed.isWarrantyValid).toBe(true);
		});

		it("should calculate maintenance overdue status", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
				nextMaintenanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.computed.isOverdueMaintenance).toBe(true);
		});

		it("should format floor display correctly", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				floor: 0,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.location.floorDisplay).toBe("Tầng trệt");
		});

		it("should return recent maintenance history", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest
				.spyOn(ticketRepository, "find")
				.mockResolvedValue([mockTicket as any]);

			const result = await service.findOne(1);

			expect(result.recentHistory).toBeDefined();
			expect(result.recentHistory.length).toBeGreaterThan(0);
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const updateDto: UpdateAssetDto = {
			name: "Updated AC Unit",
			description: "Updated description",
		};

		it("should update asset successfully", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const result = await service.update(1, updateDto);

			expect(assetRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should throw NOT_FOUND if asset does not exist", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue(null);

			await expect(service.update(999, updateDto)).rejects.toThrow(
				HttpException,
			);
		});

		it("should validate asset type when updating typeId", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(assetTypeRepository, "findOne").mockResolvedValue(null);

			const updateWithNewType: UpdateAssetDto = {
				typeId: 999,
			};

			await expect(service.update(1, updateWithNewType)).rejects.toThrow(
				new HttpException(
					"Asset type với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should validate block when updating blockId", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(blockRepository, "findOne").mockResolvedValue(null);

			const updateWithNewBlock: UpdateAssetDto = {
				blockId: 999,
			};

			await expect(service.update(1, updateWithNewBlock)).rejects.toThrow(
				new HttpException(
					"Block với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should calculate warranty expiration on warranty update", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue({
				...mockAsset,
				warrantyYears: 5,
			} as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const updateWithWarranty: UpdateAssetDto = {
				warrantyYears: 5,
			};

			await service.update(1, updateWithWarranty);

			expect(assetRepository.save).toHaveBeenCalled();
		});

		it("should update maintenance interval and next maintenance date", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const updateWithMaintenance: UpdateAssetDto = {
				maintenanceIntervalMonths: 12,
				lastMaintenanceDate: new Date().toISOString(),
			};

			await service.update(1, updateWithMaintenance);

			expect(assetRepository.save).toHaveBeenCalled();
		});
	});

	// ============================================================================
	// REMOVE
	// ============================================================================

	describe("remove", () => {
		it("should soft delete asset successfully", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(0);
			jest.spyOn(assetRepository, "save").mockResolvedValue({
				...mockAsset,
				isActive: false,
			} as any);

			const result = await service.remove(1);

			expect(result.message).toContain("Xóa tài sản thành công");
			expect(assetRepository.save).toHaveBeenCalled();
		});

		it("should throw NOT_FOUND if asset does not exist", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(HttpException);
		});

		it("should throw BAD_REQUEST if asset has active tickets", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(2);

			await expect(service.remove(1)).rejects.toThrow(
				new HttpException(
					"Không thể xóa tài sản đang có 2 tickets đang xử lý",
					HttpStatus.BAD_REQUEST,
				),
			);

			expect(assetRepository.save).not.toHaveBeenCalled();
		});
	});

	// ============================================================================
	// REMOVE MANY
	// ============================================================================

	describe("removeMany", () => {
		it("should soft delete multiple assets successfully", async () => {
			jest
				.spyOn(assetRepository, "find")
				.mockResolvedValue([mockAsset as any, mockAsset2 as any]);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(assetRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.deletedCount).toBe(2);
			expect(assetRepository.update).toHaveBeenCalledWith(
				{ id: In([1, 2]) },
				{ isActive: false },
			);
		});

		it("should throw NOT_FOUND if no assets found", async () => {
			jest.spyOn(assetRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([999, 1000])).rejects.toThrow(
				new HttpException(
					"Không tìm thấy tài sản nào với các ID đã cung cấp",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should throw BAD_REQUEST if any asset has active tickets", async () => {
			jest
				.spyOn(assetRepository, "find")
				.mockResolvedValue([mockAsset as any, mockAsset2 as any]);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(3);

			await expect(service.removeMany([1, 2])).rejects.toThrow(
				new HttpException(
					"Không thể xóa các tài sản đang có 3 tickets đang xử lý",
					HttpStatus.BAD_REQUEST,
				),
			);

			expect(assetRepository.update).not.toHaveBeenCalled();
		});

		it("should return deletion count message", async () => {
			jest
				.spyOn(assetRepository, "find")
				.mockResolvedValue([mockAsset as any, mockAsset2 as any]);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(assetRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.message).toContain("2");
			expect(result.message).toContain("Đã xóa thành công");
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration: Asset Lifecycle", () => {
		it("should create, update, and retrieve asset", async () => {
			const createDto: CreateAssetDto = {
				name: "Integration AC",
				typeId: 1,
				blockId: 1,
				floor: 1,
				locationDetail: "Test Room",
				installationDate: "2024-01-20",
				warrantyYears: 2,
				maintenanceIntervalMonths: 6,
			};

			// Create step
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValueOnce(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValueOnce(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const created = (await service.create(createDto)) as any;
			expect(created).toBeDefined();

			// Update step
			jest.clearAllMocks();
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValueOnce(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue({
				...mockAsset,
				description: "Updated",
			} as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const updated = (await service.update(created.id, {
				description: "Updated",
			})) as any;
			expect(updated).toBeDefined();

			// Retrieve step
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const retrieved = (await service.findOne(created.id)) as any;
			expect(retrieved).toBeDefined();
		});

		it("should create and delete asset", async () => {
			const createDto: CreateAssetDto = {
				name: "Delete Test Asset",
				typeId: 1,
				blockId: 1,
				floor: 2,
				locationDetail: "Test",
				installationDate: "2024-01-20",
				warrantyYears: 1,
			};

			// Create step
			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValueOnce(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValueOnce(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const created = await service.create(createDto);

			// Delete step
			jest.clearAllMocks();
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(ticketRepository, "count").mockResolvedValue(0);
			jest.spyOn(assetRepository, "save").mockResolvedValue({
				...mockAsset,
				isActive: false,
			} as any);

			const result = await service.remove(created.id);

			expect(result.message).toContain("Xóa tài sản thành công");
		});

		it("should handle warranty expiration date calculations correctly", async () => {
			const createDto: CreateAssetDto = {
				name: "Warranty Test",
				typeId: 1,
				blockId: 1,
				floor: 1,
				locationDetail: "Test",
				installationDate: "2024-01-20",
				warrantyYears: 3,
			};

			jest
				.spyOn(assetTypeRepository, "findOne")
				.mockResolvedValue(mockAssetType as any);
			jest
				.spyOn(blockRepository, "findOne")
				.mockResolvedValue(mockBlock as any);
			jest.spyOn(assetRepository, "create").mockReturnValue({
				...mockAsset,
				warrantyExpirationDate: new Date("2027-01-20"),
			} as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			await service.create(createDto);

			expect(assetRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					warrantyYears: 3,
					warrantyExpirationDate: expect.any(Date),
				}),
			);
		});
	});

	// ============================================================================
	// EDGE CASES
	// ============================================================================

	describe("Edge Cases", () => {
		it("should handle removeMany with empty array", async () => {
			jest.spyOn(assetRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([])).rejects.toThrow(HttpException);
		});

		it("should handle asset with no warranty", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
				warrantyExpirationDate: null,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.computed.isWarrantyValid).toBe(false);
		});

		it("should handle asset with no maintenance history", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.recentHistory).toEqual([]);
		});

		it("should handle basement floor display correctly", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				floor: -2,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.location.floorDisplay).toBe("Hầm B2");
		});

		it("should handle high floor numbers", async () => {
			jest.spyOn(assetRepository, "findOne").mockResolvedValue({
				...mockAsset,
				floor: 50,
				type: mockAssetType,
				block: mockBlock,
			} as any);
			jest.spyOn(ticketRepository, "find").mockResolvedValue([]);

			const result = await service.findOne(1);

			expect(result.location.floorDisplay).toBe("Tầng 50");
		});

		it("should handle multiple filter combinations", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockAsset as any]),
			};

			jest
				.spyOn(assetRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({
				search: "AC",
				blockId: 1,
				typeId: 1,
				status: AssetStatus.ACTIVE,
				floor: 1,
			});

			expect(result).toBeDefined();
		});

		it("should handle update with all fields", async () => {
			jest
				.spyOn(assetRepository, "findOne")
				.mockResolvedValue(mockAsset as any);
			jest.spyOn(assetRepository, "save").mockResolvedValue(mockAsset as any);
			jest.spyOn(service, "findOne").mockResolvedValue(mockAsset as any);

			const fullUpdate: UpdateAssetDto = {
				name: "Updated",
				description: "Updated Description",
				status: AssetStatus.MAINTENANCE,
				warrantyYears: 5,
				maintenanceIntervalMonths: 3,
				lastMaintenanceDate: new Date().toISOString(),
			};

			const result = await service.update(1, fullUpdate);

			expect(result).toBeDefined();
			expect(assetRepository.save).toHaveBeenCalled();
		});
	});
});
