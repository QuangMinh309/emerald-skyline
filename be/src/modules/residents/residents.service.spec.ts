import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Account } from "../accounts/entities/account.entity";
import { UserRole } from "../accounts/enums/user-role.enum";
import { Apartment } from "../apartments/entities/apartment.entity";
import { ApartmentResident } from "../apartments/entities/apartment-resident.entity";
import { ApartmentStatus } from "../apartments/enums/apartment-status.enum";
import { ApartmentType } from "../apartments/enums/apartment-type.enum";
import { RelationshipType } from "../apartments/enums/relationship-type.enum";
import { Booking } from "../bookings/entities/booking.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Invoice } from "../invoices/entities/invoice.entity";
import { PaymentTransaction } from "../payments/entities/payment-transaction.entity";
import { CreateResidentDto } from "./dto/create-resident.dto";
import { UpdateResidentDto } from "./dto/update-resident.dto";
import { Resident } from "./entities/resident.entity";
import { Gender } from "./enums/gender.enum";
import { ResidentsService } from "./residents.service";

describe("ResidentsService", () => {
	let service: ResidentsService;
	let residentRepository: jest.Mocked<Repository<Resident>>;
	let accountRepository: jest.Mocked<Repository<Account>>;
	let invoiceRepository: jest.Mocked<Repository<Invoice>>;
	let bookingRepository: jest.Mocked<Repository<Booking>>;
	let paymentTransactionRepository: jest.Mocked<Repository<PaymentTransaction>>;
	let apartmentResidentRepository: jest.Mocked<Repository<ApartmentResident>>;
	let apartmentRepository: jest.Mocked<Repository<Apartment>>;
	let cloudinaryService: jest.Mocked<CloudinaryService>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockAccount = {
		id: 1,
		email: "resident1@example.com",
		password: "hashed_password",
		role: UserRole.RESIDENT,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as Account;

	const mockResident = {
		id: 1,
		accountId: 1,
		fullName: "Nguyễn Văn A",
		citizenId: "079203001234",
		imageUrl: "https://cloudinary.com/image1.jpg",
		dob: new Date("1990-01-15"),
		gender: Gender.MALE,
		phoneNumber: "0901234567",
		nationality: "Vietnamese",
		province: "Hồ Chí Minh",
		district: "Quận 1",
		ward: "Phường Bến Nghé",
		detailAddress: "123 Đường Nguyễn Huệ",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		account: mockAccount,
		apartmentResidents: [],
	} as Resident;

	const mockResident2 = {
		id: 2,
		accountId: 2,
		fullName: "Trần Thị B",
		citizenId: "079203005678",
		imageUrl: null,
		dob: new Date("1992-05-20"),
		gender: Gender.FEMALE,
		phoneNumber: "0987654321",
		nationality: "Vietnamese",
		province: "Hồ Chí Minh",
		district: "Quận 2",
		ward: "Phường Thảo Điền",
		detailAddress: "456 Đường Lê Văn Lương",
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		account: {
			...mockAccount,
			id: 2,
			email: "resident2@example.com",
		},
		apartmentResidents: [],
	} as unknown as Resident;

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
	} as any;

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
		apartment: mockApartment,
	} as ApartmentResident;

	const mockResidentWithApartments = {
		...mockResident,
		apartmentResidents: [mockApartmentResident],
	} as unknown as Resident;

	const mockBooking = {
		id: 1,
		residentId: 1,
		apartmentId: 1,
		bookingDate: new Date(),
		createdAt: new Date(),
	} as any;

	const mockPayment = {
		id: 1,
		accountId: 1,
		amount: 500000,
		status: "SUCCESS",
		createdAt: new Date(),
	} as any;

	const mockInvoice = {
		id: 1,
		apartmentId: 1,
		amount: 1000000,
		status: "UNPAID",
		createdAt: new Date(),
		apartment: mockApartment,
	} as any;

	const mockImageFile = {
		fieldname: "image",
		originalname: "test.jpg",
		encoding: "7bit",
		mimetype: "image/jpeg",
		buffer: Buffer.from("fake image"),
		size: 1024,
	} as Express.Multer.File;

	// ============================================================================
	// HELPERS
	// ============================================================================

	const setupSuccessfulCreateMocks = (
		overrides: {
			existingCitizen?: Resident | null;
			existingEmail?: Account | null;
			uploadResult?: any;
			newResident?: Resident;
		} = {},
	) => {
		jest
			.spyOn(residentRepository, "findOne")
			.mockResolvedValueOnce(
				overrides.existingCitizen !== undefined
					? overrides.existingCitizen
					: null,
			);

		jest
			.spyOn(accountRepository, "findOne")
			.mockResolvedValueOnce(
				overrides.existingEmail !== undefined ? overrides.existingEmail : null,
			);

		jest.spyOn(accountRepository, "create").mockReturnValue(mockAccount);
		jest.spyOn(accountRepository, "save").mockResolvedValue(mockAccount);

		jest.spyOn(residentRepository, "create").mockReturnValue(mockResident);
		jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);

		jest
			.spyOn(residentRepository, "findOne")
			.mockResolvedValueOnce(mockResidentWithApartments);

		if (overrides.uploadResult) {
			jest
				.spyOn(cloudinaryService, "uploadFile")
				.mockResolvedValue(overrides.uploadResult);
		}
	};

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResidentsService,
				{
					provide: getRepositoryToken(Resident),
					useValue: {
						findOne: jest.fn(),
						find: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
						createQueryBuilder: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Account),
					useValue: {
						findOne: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Invoice),
					useValue: {
						find: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Booking),
					useValue: {
						find: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(PaymentTransaction),
					useValue: {
						find: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(ApartmentResident),
					useValue: {
						find: jest.fn(),
						count: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Apartment),
					useValue: {
						findOne: jest.fn(),
						update: jest.fn(),
					},
				},
				{
					provide: CloudinaryService,
					useValue: {
						uploadFile: jest.fn(),
						deleteFile: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<ResidentsService>(ResidentsService);
		residentRepository = module.get(getRepositoryToken(Resident));
		accountRepository = module.get(getRepositoryToken(Account));
		invoiceRepository = module.get(getRepositoryToken(Invoice));
		bookingRepository = module.get(getRepositoryToken(Booking));
		paymentTransactionRepository = module.get(
			getRepositoryToken(PaymentTransaction),
		);
		apartmentResidentRepository = module.get(
			getRepositoryToken(ApartmentResident),
		);
		apartmentRepository = module.get(getRepositoryToken(Apartment));
		cloudinaryService = module.get(CloudinaryService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const createDto: CreateResidentDto = {
			email: "newresident@example.com",
			fullName: "Nguyễn Văn C",
			citizenId: "079203009999",
			dob: "1995-03-10",
			gender: Gender.MALE,
			phoneNumber: "0912345678",
			nationality: "Vietnamese",
			province: "Hồ Chí Minh",
			district: "Quận 3",
			ward: "Phường 9",
			detailAddress: "789 Đường A",
		};

		it("should create resident successfully without image", async () => {
			setupSuccessfulCreateMocks();

			const result = await service.create(createDto);

			expect(result).toBeDefined();
			expect(accountRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					email: createDto.email,
					role: UserRole.RESIDENT,
					isActive: true,
				}),
			);
			expect(residentRepository.create).toHaveBeenCalled();
			expect(result.residences).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ relationship: RelationshipType.OWNER }),
				]),
			);
		});

		it("should create resident with image upload", async () => {
			const uploadResult = {
				secure_url: "https://cloudinary.com/new-image.jpg",
			} as any;
			setupSuccessfulCreateMocks({ uploadResult });

			const result = await service.create(createDto, mockImageFile);

			expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockImageFile);
			expect(result).toBeDefined();
		});

		it("should throw CONFLICT if citizen ID already exists", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException("Citizen ID đã tồn tại", HttpStatus.CONFLICT),
			);
		});

		it("should throw CONFLICT if email already exists", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(mockAccount);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException("Email đã tồn tại", HttpStatus.CONFLICT),
			);
		});

		it("should throw BAD_REQUEST on image upload failure", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);
			jest
				.spyOn(cloudinaryService, "uploadFile")
				.mockRejectedValue(new Error("Upload failed"));

			await expect(service.create(createDto, mockImageFile)).rejects.toThrow(
				new HttpException(
					"Upload ảnh không thành công",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should generate password from citizen ID", async () => {
			setupSuccessfulCreateMocks();

			await service.create(createDto);

			expect(accountRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					password: createDto.citizenId,
				}),
			);
		});
	});

	// ============================================================================
	// FIND ALL
	// ============================================================================

	describe("findAll", () => {
		it("should return all active residents with residences", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockResidentWithApartments]),
			};

			jest
				.spyOn(residentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result).toHaveLength(1);
			expect(result[0].residences).toBeDefined();
		});

		it("should filter by gender", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockResidentWithApartments]),
			};

			jest
				.spyOn(residentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ gender: Gender.MALE });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"resident.gender = :gender",
				{ gender: Gender.MALE },
			);
		});

		it("should filter by nationality", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockResidentWithApartments]),
			};

			jest
				.spyOn(residentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ nationality: "Vietnamese" });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"resident.nationality = :nationality",
				{ nationality: "Vietnamese" },
			);
		});

		it("should search by full name or citizen ID", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockResidentWithApartments]),
			};

			jest
				.spyOn(residentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			await service.findAll({ search: "Nguyễn" });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				"(resident.fullName ILIKE :search OR resident.citizenId ILIKE :search)",
				{ search: "%Nguyễn%" },
			);
		});

		it("should return empty array when no residents found", async () => {
			const mockQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			jest
				.spyOn(residentRepository, "createQueryBuilder")
				.mockReturnValue(mockQueryBuilder as any);

			const result = await service.findAll({});

			expect(result).toEqual([]);
		});
	});

	// ============================================================================
	// FIND ONE
	// ============================================================================

	describe("findOne", () => {
		it("should return resident with residences formatted correctly", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResidentWithApartments);

			const result = await service.findOne(1);

			expect(result).toBeDefined();
			expect(result.residences).toHaveLength(1);
			expect(result.residences[0]).toEqual(
				expect.objectContaining({
					relationship: RelationshipType.OWNER,
				}),
			);
		});

		it("should throw NOT_FOUND when resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException(
					"Resident với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should only return active residents", async () => {
			const inactiveResident = { ...mockResident, isActive: false };
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(1)).rejects.toThrow(HttpException);
		});
	});

	// ============================================================================
	// FIND BY CITIZEN ID
	// ============================================================================

	describe("findByCitizenId", () => {
		it("should return resident by citizen ID", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);

			const result = await service.findByCitizenId("079203001234");

			expect(result).toEqual(mockResident);
			expect(residentRepository.findOne).toHaveBeenCalledWith({
				where: { citizenId: "079203001234", isActive: true },
				relations: ["account"],
			});
		});

		it("should return null if citizen ID not found", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			const result = await service.findByCitizenId("invalid_id");

			expect(result).toBeNull();
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const updateDto: UpdateResidentDto = {
			fullName: "Nguyễn Văn A Updated",
			phoneNumber: "0909999999",
			province: "Hà Nội",
		};

		it("should update resident fields successfully", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResidentWithApartments)
				.mockResolvedValueOnce(mockResidentWithApartments);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);

			const result = await service.update(1, updateDto);

			expect(residentRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should update resident with new image", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResidentWithApartments)
				.mockResolvedValueOnce(mockResidentWithApartments);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);
			jest.spyOn(cloudinaryService, "uploadFile").mockResolvedValue({
				secure_url: "https://cloudinary.com/new-image.jpg",
			} as any);
			jest
				.spyOn(cloudinaryService, "deleteFile")
				.mockResolvedValue(undefined as any);

			const result = await service.update(1, updateDto, mockImageFile);

			expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockImageFile);
			expect(cloudinaryService.deleteFile).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should throw CONFLICT if new citizen ID already exists", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResidentWithApartments);
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResident2);

			await expect(
				service.update(1, {
					...updateDto,
					citizenId: "079203005678",
				}),
			).rejects.toThrow(
				new HttpException("Citizen ID đã tồn tại", HttpStatus.CONFLICT),
			);
		});

		it("should throw BAD_REQUEST on image upload failure", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResidentWithApartments);
			jest
				.spyOn(cloudinaryService, "uploadFile")
				.mockRejectedValue(new Error("Upload failed"));

			await expect(service.update(1, updateDto, mockImageFile)).rejects.toThrow(
				new HttpException("Failed to upload ảnh", HttpStatus.BAD_REQUEST),
			);
		});

		it("should update DOB when provided as string", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResidentWithApartments)
				.mockResolvedValueOnce(mockResidentWithApartments);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);

			const dtoWithDob = {
				...updateDto,
				dob: "2000-01-01",
			};

			await service.update(1, dtoWithDob);

			expect(residentRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					dob: expect.any(Date),
				}),
			);
		});
	});

	// ============================================================================
	// REMOVE
	// ============================================================================

	describe("remove", () => {
		it("should soft delete resident successfully", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(mockAccount);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);
			jest.spyOn(accountRepository, "save").mockResolvedValue(mockAccount);

			const result = await service.remove(1);

			expect(result.isActive).toBe(false);
			expect(residentRepository.save).toHaveBeenCalled();
			expect(accountRepository.save).toHaveBeenCalled();
		});

		it("should throw BAD_REQUEST if resident is living in apartment", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);

			await expect(service.remove(1)).rejects.toThrow(
				new HttpException(
					"Không thể xóa cư dân đang là chủ hộ hoặc thành viên. Vui lòng thay đổi chủ hộ/thành viên trước khi xóa.",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should throw NOT_FOUND when resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(HttpException);
		});

		it("should also deactivate associated account", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(mockAccount);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);
			jest.spyOn(accountRepository, "save").mockResolvedValue(mockAccount);

			await service.remove(1);

			expect(accountRepository.findOne).toHaveBeenCalled();
			expect(accountRepository.save).toHaveBeenCalled();
		});
	});

	// ============================================================================
	// REMOVE MANY
	// ============================================================================

	describe("removeMany", () => {
		it("should soft delete multiple residents successfully", async () => {
			jest
				.spyOn(residentRepository, "find")
				.mockResolvedValue([mockResident, mockResident2]);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest
				.spyOn(residentRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);
			jest
				.spyOn(accountRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.deletedCount).toBe(2);
			expect(residentRepository.update).toHaveBeenCalledWith(
				{ id: In([1, 2]) },
				{ isActive: false },
			);
		});

		it("should throw NOT_FOUND if no residents found", async () => {
			jest.spyOn(residentRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([999])).rejects.toThrow(
				new HttpException(
					"Không tìm thấy cư dân với các ID đã cung cấp",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should throw BAD_REQUEST if any resident is living in apartment", async () => {
			jest
				.spyOn(residentRepository, "find")
				.mockResolvedValue([mockResident, mockResident2]);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);

			await expect(service.removeMany([1, 2])).rejects.toThrow(
				new HttpException(
					"Không thể xóa cư dân đang là chủ hộ hoặc thành viên. Vui lòng thay đổi chủ hộ/thành viên trước khi xóa.",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should also deactivate associated accounts", async () => {
			jest
				.spyOn(residentRepository, "find")
				.mockResolvedValue([mockResident, mockResident2]);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest
				.spyOn(residentRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);
			jest
				.spyOn(accountRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			await service.removeMany([1, 2]);

			expect(accountRepository.update).toHaveBeenCalledWith(
				{ id: In([1, 2]) },
				{ isActive: false },
			);
		});
	});

	// ============================================================================
	// GET MY PROFILE
	// ============================================================================

	describe("getMyProfile", () => {
		it("should return resident profile with apartments and bookings", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);
			jest
				.spyOn(apartmentRepository, "findOne")
				.mockResolvedValue(mockApartment);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([mockBooking]);
			jest
				.spyOn(paymentTransactionRepository, "find")
				.mockResolvedValue([mockPayment]);

			const result = await service.getMyProfile(1);

			expect(result).toBeDefined();
			expect(result.apartments).toHaveLength(1);
			expect(result.bookings).toHaveLength(1);
			expect(result.payments).toHaveLength(1);
		});

		it("should return empty arrays when resident has no bookings/payments", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([]);
			jest.spyOn(paymentTransactionRepository, "find").mockResolvedValue([]);

			const result = await service.getMyProfile(1);

			expect(result.apartments).toEqual([]);
			expect(result.bookings).toEqual([]);
			expect(result.payments).toEqual([]);
		});

		it("should throw NOT_FOUND if resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.getMyProfile(999)).rejects.toThrow(
				new HttpException("Cư dân không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should filter out deleted apartments", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);
			jest.spyOn(apartmentRepository, "findOne").mockResolvedValue(null);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([]);
			jest.spyOn(paymentTransactionRepository, "find").mockResolvedValue([]);

			const result = await service.getMyProfile(1);

			expect(result.apartments).toEqual([]);
		});
	});

	// ============================================================================
	// GET MY INVOICES
	// ============================================================================

	describe("getMyInvoices", () => {
		it("should return invoices and payments for resident", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);
			jest.spyOn(invoiceRepository, "find").mockResolvedValue([mockInvoice]);
			jest
				.spyOn(paymentTransactionRepository, "find")
				.mockResolvedValue([mockPayment]);

			const result = await service.getMyInvoices(1);

			expect(result.invoices).toHaveLength(1);
			expect(result.payments).toHaveLength(1);
		});

		it("should return empty array if resident has no apartments", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest.spyOn(invoiceRepository, "find").mockResolvedValue([]);
			jest.spyOn(paymentTransactionRepository, "find").mockResolvedValue([]);

			const result = await service.getMyInvoices(1);

			expect(result.invoices).toEqual([]);
			expect(result.payments).toEqual([]);
		});

		it("should throw NOT_FOUND if resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.getMyInvoices(999)).rejects.toThrow(
				new HttpException("Cư dân không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should order invoices and payments by creation date DESC", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);
			jest.spyOn(invoiceRepository, "find").mockResolvedValue([mockInvoice]);
			jest
				.spyOn(paymentTransactionRepository, "find")
				.mockResolvedValue([mockPayment]);

			await service.getMyInvoices(1);

			expect(invoiceRepository.find).toHaveBeenCalledWith(
				expect.objectContaining({
					order: { createdAt: "DESC" },
				}),
			);
			expect(paymentTransactionRepository.find).toHaveBeenCalledWith(
				expect.objectContaining({
					order: { createdAt: "DESC" },
				}),
			);
		});
	});

	// ============================================================================
	// GET RESIDENT INVOICES
	// ============================================================================

	describe("getResidentInvoices", () => {
		it("should return invoices for specific resident", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);
			jest.spyOn(invoiceRepository, "find").mockResolvedValue([mockInvoice]);

			const result = await service.getResidentInvoices(1);

			expect(result.invoices).toHaveLength(1);
		});

		it("should throw NOT_FOUND if resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			await expect(service.getResidentInvoices(999)).rejects.toThrow(
				new HttpException("Cư dân không tồn tại", HttpStatus.NOT_FOUND),
			);
		});

		it("should return empty array if resident has no apartments", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(mockResident);
			jest.spyOn(apartmentResidentRepository, "find").mockResolvedValue([]);
			jest.spyOn(invoiceRepository, "find").mockResolvedValue([]);

			const result = await service.getResidentInvoices(1);

			expect(result.invoices).toEqual([]);
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration: Complete Resident Lifecycle", () => {
		it("should create, update, and retrieve resident", async () => {
			const createDto: CreateResidentDto = {
				email: "lifecycle@example.com",
				fullName: "Test Lifecycle",
				citizenId: "999999999999",
				dob: "1995-01-01",
				gender: Gender.MALE,
				phoneNumber: "0999999999",
				nationality: "Vietnamese",
				province: "Hà Nội",
				district: "Ba Đình",
				ward: "Phường Cống Vị",
				detailAddress: "Test Address",
			};

			setupSuccessfulCreateMocks();

			// Create
			const created = await service.create(createDto);
			expect(created).toBeDefined();

			// Update
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValueOnce(mockResidentWithApartments)
				.mockResolvedValueOnce(mockResidentWithApartments);
			jest.spyOn(residentRepository, "save").mockResolvedValue(mockResident);

			const updated = await service.update(created.id, {
				fullName: "Updated Name",
			});
			expect(updated).toBeDefined();

			// Find
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResidentWithApartments);
			const found = await service.findOne(created.id);
			expect(found).toBeDefined();
		});

		it("should prevent deletion of resident with apartments", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResidentWithApartments);
			jest
				.spyOn(apartmentResidentRepository, "find")
				.mockResolvedValue([mockApartmentResident]);

			await expect(service.remove(1)).rejects.toThrow(HttpException);
		});
	});
});
