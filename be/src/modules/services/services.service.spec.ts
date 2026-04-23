import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookingsService } from "../bookings/bookings.service";
import { Booking } from "../bookings/entities/booking.entity";
import { BookingStatus } from "../bookings/enums/booking-status.enum";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Resident } from "../residents/entities/resident.entity";
import { CheckSlotAvailabilityDto } from "./dtos/check-slot-availability.dto";
import { CreateServiceDto } from "./dtos/create-service.dto";
import { ReserveSlotDto } from "./dtos/reserve-slot.dto";
import { UpdateServiceDto } from "./dtos/update-service.dto";
import { Service } from "./entities/service.entity";
import { SlotAvailability } from "./entities/slot-availability.entity";
import { ServiceType } from "./enums/service-type.enum";
import { ServicesService } from "./services.service";

describe("ServicesService", () => {
	let service: ServicesService;
	let serviceRepository: jest.Mocked<Repository<Service>>;
	let slotRepository: jest.Mocked<Repository<SlotAvailability>>;
	let residentRepository: jest.Mocked<Repository<Resident>>;
	let bookingRepository: jest.Mocked<Repository<Booking>>;
	let bookingsService: jest.Mocked<BookingsService>;
	let cloudinaryService: jest.Mocked<CloudinaryService>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockService = {
		id: 1,
		name: "Fitness Center",
		description: "Modern fitness facility",
		openHour: "06:00",
		closeHour: "22:00",
		imageUrl: "https://example.com/fitness.jpg",
		unitPrice: 100000,
		unitTimeBlock: 60,
		totalSlot: 20,
		type: ServiceType.NORMAL,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Service;

	const mockService2 = {
		id: 2,
		name: "Swimming Pool",
		description: "Olympic size pool",
		openHour: "07:00",
		closeHour: "21:00",
		imageUrl: "https://example.com/pool.jpg",
		unitPrice: 150000,
		unitTimeBlock: 30,
		totalSlot: 30,
		type: ServiceType.COMMUNITY,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Service;

	const mockResident = {
		id: 1,
		accountId: 1,
		fullName: "John Resident",
		phoneNumber: "0912345678",
		isActive: true,
	} as unknown as Resident;

	const mockSlot = {
		id: 1,
		serviceId: 1,
		startTime: new Date("2024-12-25T06:00:00"),
		endTime: new Date("2024-12-25T07:00:00"),
		remainingSlot: 10,
	} as unknown as SlotAvailability;

	const mockBooking = {
		id: 1,
		code: "BK001",
		residentId: 1,
		serviceId: 1,
		bookingDate: new Date("2024-12-25"),
		timestamps: [{ startTime: "06:00", endTime: "07:00" }],
		unitPrice: 100000,
		totalPrice: 100000,
		status: BookingStatus.PENDING,
		resident: mockResident,
		createdAt: new Date(),
	} as unknown as Booking;

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ServicesService,
				{
					provide: getRepositoryToken(Service),
					useValue: {
						find: jest.fn(),
						findOne: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(SlotAvailability),
					useValue: {
						find: jest.fn(),
						findOne: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						manager: {
							transaction: jest.fn(),
							findOne: jest.fn(),
							create: jest.fn(),
							save: jest.fn(),
						},
					},
				},
				{
					provide: getRepositoryToken(Resident),
					useValue: {
						findOne: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(Booking),
					useValue: {
						find: jest.fn(),
					},
				},
				{
					provide: BookingsService,
					useValue: {
						createBooking: jest.fn(),
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

		service = module.get<ServicesService>(ServicesService);
		serviceRepository = module.get(getRepositoryToken(Service));
		slotRepository = module.get(getRepositoryToken(SlotAvailability));
		residentRepository = module.get(getRepositoryToken(Resident));
		bookingRepository = module.get(getRepositoryToken(Booking));
		bookingsService = module.get(BookingsService);
		cloudinaryService = module.get(CloudinaryService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// FIND ALL
	// ============================================================================

	describe("findAll", () => {
		it("should return all active services", async () => {
			jest
				.spyOn(serviceRepository, "find")
				.mockResolvedValue([mockService as any, mockService2 as any]);

			const result = await service.findAll();

			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("Fitness Center");
			expect(serviceRepository.find).toHaveBeenCalledWith({
				where: { isActive: true },
				order: { createdAt: "DESC" },
			});
		});

		it("should return empty array if no services exist", async () => {
			jest.spyOn(serviceRepository, "find").mockResolvedValue([]);

			const result = await service.findAll();

			expect(result).toEqual([]);
		});

		it("should transform service to response DTO", async () => {
			jest
				.spyOn(serviceRepository, "find")
				.mockResolvedValue([mockService as any]);

			const result = await service.findAll();

			expect(result[0]).toHaveProperty("id");
			expect(result[0]).toHaveProperty("name");
			expect(result[0]).toHaveProperty("typeLabel");
		});
	});

	// ============================================================================
	// FIND ONE
	// ============================================================================

	describe("findOne", () => {
		it("should return service by ID", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);

			const result = await service.findOne(1);

			expect(result.id).toBe(1);
			expect(result.name).toBe("Fitness Center");
			expect(serviceRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1, isActive: true },
			});
		});

		it("should throw NOT_FOUND if service does not exist", async () => {
			jest.spyOn(serviceRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException(
					"Service với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should include typeLabel in response", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);

			const result = await service.findOne(1);

			expect(result).toHaveProperty("typeLabel");
		});
	});

	// ============================================================================
	// FIND ONE WITH BOOKING HISTORY
	// ============================================================================

	describe("findOneWithBookingHistory", () => {
		it("should return service with booking history", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(bookingRepository, "find")
				.mockResolvedValue([mockBooking as any]);

			const result = await service.findOneWithBookingHistory(1);

			expect(result.id).toBe(1);
			expect(result.bookingHistory).toBeDefined();
			expect(result.bookingHistory).toHaveLength(1);
		});

		it("should throw NOT_FOUND if service does not exist", async () => {
			jest.spyOn(serviceRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOneWithBookingHistory(999)).rejects.toThrow(
				HttpException,
			);
		});

		it("should include resident name in booking history", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(bookingRepository, "find")
				.mockResolvedValue([mockBooking as any]);

			const result = await service.findOneWithBookingHistory(1);

			expect(result.bookingHistory[0].residentName).toBe("John Resident");
		});

		it("should return empty booking history if no bookings exist", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([]);

			const result = await service.findOneWithBookingHistory(1);

			expect(result.bookingHistory).toEqual([]);
		});
	});

	// ============================================================================
	// CHECK SLOT AVAILABILITY
	// ============================================================================

	describe("checkSlotAvailability", () => {
		it("should return available slots for a given date", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([]);

			const checkSlotDto: CheckSlotAvailabilityDto = {
				date: "2024-12-25",
			};

			const result = await service.checkSlotAvailability(1, checkSlotDto);

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]).toHaveProperty("startTime");
			expect(result[0]).toHaveProperty("remainingSlot");
			expect(result[0]).toHaveProperty("isAvailable");
		});

		it("should return slots with remaining count from database", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([
				{
					startTime: new Date("2024-12-25T06:00:00"),
					endTime: new Date("2024-12-25T07:00:00"),
					remainingSlot: 5,
				} as any,
			]);

			const checkSlotDto: CheckSlotAvailabilityDto = {
				date: "2024-12-25",
			};

			const result = await service.checkSlotAvailability(1, checkSlotDto);

			const firstSlot = result.find(
				(s) => s.startTime.getHours() === 6 && s.startTime.getMinutes() === 0,
			);
			expect(firstSlot?.remainingSlot).toBe(5);
		});

		it("should mark slot as unavailable if remainingSlot is 0", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([
				{
					startTime: new Date("2024-12-25T06:00:00"),
					endTime: new Date("2024-12-25T07:00:00"),
					remainingSlot: 0,
				} as any,
			]);

			const checkSlotDto: CheckSlotAvailabilityDto = {
				date: "2024-12-25",
			};

			const result = await service.checkSlotAvailability(1, checkSlotDto);

			const firstSlot = result.find(
				(s) => s.startTime.getHours() === 6 && s.startTime.getMinutes() === 0,
			);
			expect(firstSlot?.isAvailable).toBe(false);
		});

		it("should generate slots based on unitTimeBlock", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue({ ...mockService, unitTimeBlock: 30 } as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([]);

			const checkSlotDto: CheckSlotAvailabilityDto = {
				date: "2024-12-25",
			};

			const result = await service.checkSlotAvailability(1, checkSlotDto);

			// With 30 minute blocks from 06:00 to 22:00, should have many slots
			expect(result.length).toBeGreaterThan(20);
		});
	});

	// ============================================================================
	// RESERVE SLOT
	// ============================================================================

	describe("reserveSlot", () => {
		it("should throw NOT_FOUND if resident does not exist", async () => {
			jest.spyOn(residentRepository, "findOne").mockResolvedValue(null);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [{ startTime: "06:00", endTime: "07:00" }],
			};

			await expect(service.reserveSlot(1, reserveSlotDto, 999)).rejects.toThrow(
				new HttpException(
					"Không tìm thấy thông tin cư dân",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should throw NOT_FOUND if service does not exist", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest.spyOn(serviceRepository, "findOne").mockResolvedValue(null);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [{ startTime: "06:00", endTime: "07:00" }],
			};

			await expect(service.reserveSlot(1, reserveSlotDto, 1)).rejects.toThrow(
				HttpException,
			);
		});

		it("should throw BAD_REQUEST if no slots provided", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [],
			};

			await expect(service.reserveSlot(1, reserveSlotDto, 1)).rejects.toThrow(
				new HttpException(
					"Không có slot nào được cung cấp",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should throw BAD_REQUEST if slot is outside service hours", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(slotRepository.manager, "transaction")
				.mockImplementation(async (callback: any) => {
					return callback({
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockReturnValue(mockSlot),
						save: jest.fn().mockResolvedValue(mockSlot),
					});
				});

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [{ startTime: "23:00", endTime: "00:00" }], // Outside 06:00-22:00
			};

			await expect(service.reserveSlot(1, reserveSlotDto, 1)).rejects.toThrow(
				HttpException,
			);
		});

		it("should throw BAD_REQUEST if end time is before start time", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [{ startTime: "07:00", endTime: "06:00" }], // End before start
			};

			// This will fail during price calculation
			await expect(service.reserveSlot(1, reserveSlotDto, 1)).rejects.toThrow(
				HttpException,
			);
		});

		it("should remove duplicate slots before reserving", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);

			jest
				.spyOn(slotRepository.manager, "transaction")
				.mockImplementation(async (callback: any) => {
					return callback({
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockReturnValue(mockSlot),
						save: jest.fn().mockResolvedValue(mockSlot),
					});
				});

			jest
				.spyOn(bookingsService, "createBooking")
				.mockResolvedValue(mockBooking as any);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [
					{ startTime: "06:00", endTime: "07:00" },
					{ startTime: "06:00", endTime: "07:00" },
				],
			};

			// Service should remove duplicate slots and create booking successfully
			const result = await service.reserveSlot(1, reserveSlotDto, 1);
			expect(result).toBeDefined();
			expect(result.id).toBe(1);
		});

		it("should create booking through bookingsService", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(slotRepository.manager, "transaction")
				.mockImplementation(async (callback: any) => {
					return callback({
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockReturnValue(mockSlot),
						save: jest.fn().mockResolvedValue(mockSlot),
					});
				});
			jest
				.spyOn(bookingsService, "createBooking")
				.mockResolvedValue(mockBooking as any);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [{ startTime: "06:00", endTime: "07:00" }],
			};

			const result = await service.reserveSlot(1, reserveSlotDto, 1);

			expect(bookingsService.createBooking).toHaveBeenCalled();
			expect(result).toBeDefined();
		});
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const createDto: CreateServiceDto = {
			name: "New Service",
			description: "New service description",
			openHour: "08:00",
			closeHour: "20:00",
			unitPrice: 200000,
			unitTimeBlock: 45,
			totalSlot: 15,
			type: ServiceType.NORMAL,
		};

		it("should create service without image", async () => {
			jest
				.spyOn(serviceRepository, "create")
				.mockReturnValue(mockService as any);
			jest
				.spyOn(serviceRepository, "save")
				.mockResolvedValue(mockService as any);

			const result = await service.create(createDto);

			expect(result).toBeDefined();
			expect(serviceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: createDto.name,
					type: ServiceType.NORMAL,
					isActive: true,
				}),
			);
		});

		it("should create service with image upload", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "test.jpg",
			} as Express.Multer.File;

			jest.spyOn(cloudinaryService, "uploadFile").mockResolvedValue({
				secure_url: "https://example.com/new.jpg",
			} as any);
			jest
				.spyOn(serviceRepository, "create")
				.mockReturnValue(mockService as any);
			jest
				.spyOn(serviceRepository, "save")
				.mockResolvedValue(mockService as any);

			const result = await service.create(createDto, mockFile);

			expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile);
			expect(result).toBeDefined();
		});

		it("should throw BAD_REQUEST if image upload fails", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "test.jpg",
			} as Express.Multer.File;

			jest
				.spyOn(cloudinaryService, "uploadFile")
				.mockRejectedValue(new Error("Upload failed"));

			await expect(service.create(createDto, mockFile)).rejects.toThrow(
				new HttpException(
					"Upload ảnh không thành công",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should set default status to NORMAL if not provided", async () => {
			const dtoWithoutType: CreateServiceDto = {
				...createDto,
				type: undefined as any,
			};

			jest
				.spyOn(serviceRepository, "create")
				.mockReturnValue(mockService as any);
			jest
				.spyOn(serviceRepository, "save")
				.mockResolvedValue(mockService as any);

			await service.create(dtoWithoutType);

			expect(serviceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					type: ServiceType.NORMAL,
				}),
			);
		});

		it("should set isActive to true on creation", async () => {
			jest
				.spyOn(serviceRepository, "create")
				.mockReturnValue(mockService as any);
			jest
				.spyOn(serviceRepository, "save")
				.mockResolvedValue(mockService as any);

			await service.create(createDto);

			expect(serviceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					isActive: true,
				}),
			);
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const updateDto: UpdateServiceDto = {
			name: "Updated Service",
			unitPrice: 250000,
		};

		it("should update service successfully", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValueOnce(mockService as any)
				.mockResolvedValueOnce({ ...mockService, ...updateDto } as any);

			const result = await service.update(1, updateDto);

			expect(serviceRepository.update).toHaveBeenCalledWith(
				1,
				expect.any(Object),
			);
			expect(result).toBeDefined();
		});

		it("should throw NOT_FOUND if service does not exist", async () => {
			jest.spyOn(serviceRepository, "findOne").mockResolvedValue(null);

			await expect(service.update(999, updateDto)).rejects.toThrow(
				HttpException,
			);
		});

		it("should handle image upload on update", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "updated.jpg",
			} as Express.Multer.File;

			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(cloudinaryService, "uploadFile").mockResolvedValue({
				secure_url: "https://example.com/updated.jpg",
			} as any);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValueOnce(mockService as any)
				.mockResolvedValueOnce({
					...mockService,
					imageUrl: "https://example.com/updated.jpg",
				} as any);

			const result = await service.update(1, updateDto, mockFile);

			expect(cloudinaryService.uploadFile).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should throw BAD_REQUEST if image upload fails", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "test.jpg",
			} as Express.Multer.File;

			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(cloudinaryService, "uploadFile")
				.mockRejectedValue(new Error("Upload failed"));

			await expect(service.update(1, updateDto, mockFile)).rejects.toThrow(
				new HttpException(
					"Upload ảnh không thành công",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should only update provided fields", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValueOnce(mockService as any)
				.mockResolvedValueOnce(mockService as any);

			const partialUpdate: UpdateServiceDto = {
				name: "Updated",
			};

			await service.update(1, partialUpdate);

			expect(serviceRepository.update).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					name: "Updated",
				}),
			);
		});

		it("should not update undefined fields", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValueOnce(mockService as any)
				.mockResolvedValueOnce(mockService as any);

			const emptyUpdate: UpdateServiceDto = {};

			await service.update(1, emptyUpdate);

			expect(serviceRepository.update).toHaveBeenCalled();
		});
	});

	// ============================================================================
	// SOFT DELETE
	// ============================================================================

	describe("softDelete", () => {
		it("should soft delete service successfully", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([]);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);

			const result = await service.softDelete(1);

			expect(result.message).toContain("Xóa dịch vụ");
			expect(serviceRepository.update).toHaveBeenCalledWith(1, {
				isActive: false,
			});
		});

		it("should throw NOT_FOUND if service does not exist", async () => {
			jest.spyOn(serviceRepository, "findOne").mockResolvedValue(null);

			await expect(service.softDelete(999)).rejects.toThrow(HttpException);
		});

		it("should throw BAD_REQUEST if service has incomplete bookings", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([
				{
					...mockBooking,
					status: BookingStatus.PENDING,
				} as any,
			]);

			try {
				await service.softDelete(1);
				fail("Should have thrown HttpException");
			} catch (error: any) {
				expect(error).toBeInstanceOf(HttpException);
				const response = error.getResponse() as any;
				const message =
					typeof response === "string" ? response : response.message;
				expect(message).toContain("Không thể xóa dịch vụ");
			}

			expect(serviceRepository.update).not.toHaveBeenCalled();
		});
	});

	// ============================================================================
	// SOFT DELETE MULTIPLE
	// ============================================================================

	describe("softDeleteMultiple", () => {
		it("should soft delete multiple services successfully", async () => {
			jest
				.spyOn(serviceRepository, "find")
				.mockResolvedValue([mockService as any, mockService2 as any]);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.softDeleteMultiple([1, 2]);

			expect(result.count).toBe(2);
			expect(result.message).toContain("2");
		});

		it("should throw BAD_REQUEST if ids array is empty", async () => {
			await expect(service.softDeleteMultiple([])).rejects.toThrow(
				new HttpException(
					"Danh sách ID không được để trống",
					HttpStatus.BAD_REQUEST,
				),
			);
		});

		it("should throw NOT_FOUND if no valid services found", async () => {
			jest.spyOn(serviceRepository, "find").mockResolvedValue([]);

			await expect(service.softDeleteMultiple([999, 1000])).rejects.toThrow(
				new HttpException(
					"Không tìm thấy dịch vụ nào để xóa",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should only delete valid services if some IDs are invalid", async () => {
			jest
				.spyOn(serviceRepository, "find")
				.mockResolvedValue([mockService as any]);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);

			const result = await service.softDeleteMultiple([1, 999]);

			expect(result.count).toBe(1);
			expect(serviceRepository.update).toHaveBeenCalledWith([1], {
				isActive: false,
			});
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration: Service Lifecycle", () => {
		it("should create, update, and delete service", async () => {
			const createDto: CreateServiceDto = {
				name: "Integration Service",
				description: "Integration test service",
				openHour: "09:00",
				closeHour: "18:00",
				unitPrice: 300000,
				unitTimeBlock: 60,
				totalSlot: 25,
				type: ServiceType.COMMUNITY,
			};

			// Create
			jest
				.spyOn(serviceRepository, "create")
				.mockReturnValue(mockService as any);
			jest
				.spyOn(serviceRepository, "save")
				.mockResolvedValue(mockService as any);

			const created = await service.create(createDto);
			expect(created).toBeDefined();

			// Update
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);

			const updated = await service.update(created.id, {
				name: "Updated Service",
			});
			expect(updated).toBeDefined();

			// Delete
			jest.clearAllMocks();
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(bookingRepository, "find").mockResolvedValue([]);
			jest
				.spyOn(serviceRepository, "update")
				.mockResolvedValue({ affected: 1 } as any);

			const deleted = await service.softDelete(created.id);
			expect(deleted.message).toContain("Xóa");
		});

		it("should check availability and reserve slots", async () => {
			// Check availability
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([]);

			const availability = await service.checkSlotAvailability(1, {
				date: "2024-12-25",
			});
			expect(availability.length).toBeGreaterThan(0);

			// Reserve slot
			jest.clearAllMocks();
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(slotRepository.manager, "transaction")
				.mockImplementation(async (callback: any) => {
					return callback({
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockReturnValue(mockSlot),
						save: jest.fn().mockResolvedValue(mockSlot),
					});
				});
			jest
				.spyOn(bookingsService, "createBooking")
				.mockResolvedValue(mockBooking as any);

			const reserved = await service.reserveSlot(
				1,
				{
					bookingDate: "2024-12-25",
					slots: [{ startTime: "06:00", endTime: "07:00" }],
				},
				1,
			);

			expect(reserved).toBeDefined();
		});

		it("should get service with full booking history", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(bookingRepository, "find")
				.mockResolvedValue([mockBooking as any]);

			const result = await service.findOneWithBookingHistory(1);

			expect(result.bookingHistory).toBeDefined();
			expect(result.bookingHistory).toHaveLength(1);
			expect(result).toHaveProperty("name");
			expect(result).toHaveProperty("unitPrice");
		});
	});

	// ============================================================================
	// EDGE CASES
	// ============================================================================

	describe("Edge Cases", () => {
		it("should handle service with null imageUrl", async () => {
			jest
				.spyOn(serviceRepository, "find")
				.mockResolvedValue([{ ...mockService, imageUrl: null } as any]);

			const result = await service.findAll();

			expect(result[0].imageUrl).toBeNull();
		});

		it("should handle very small unitTimeBlock (15 minutes)", async () => {
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue({ ...mockService, unitTimeBlock: 15 } as any);
			jest.spyOn(slotRepository, "find").mockResolvedValue([]);

			const result = await service.checkSlotAvailability(1, {
				date: "2024-12-25",
			});

			expect(result.length).toBeGreaterThan(30);
		});

		it("should handle service with COMMUNITY type", async () => {
			const communityService = { ...mockService, type: ServiceType.COMMUNITY };
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(communityService as any);

			const result = await service.findOne(1);

			expect(result.type).toBe(ServiceType.COMMUNITY);
			expect(result).toHaveProperty("typeLabel");
		});

		it("should handle booking with multiple slots", async () => {
			jest
				.spyOn(residentRepository, "findOne")
				.mockResolvedValue(mockResident as any);
			jest
				.spyOn(serviceRepository, "findOne")
				.mockResolvedValue(mockService as any);
			jest
				.spyOn(slotRepository.manager, "transaction")
				.mockImplementation(async (callback: any) => {
					return callback({
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockReturnValue(mockSlot),
						save: jest.fn().mockResolvedValue(mockSlot),
					});
				});
			jest
				.spyOn(bookingsService, "createBooking")
				.mockResolvedValue(mockBooking as any);

			const reserveSlotDto: ReserveSlotDto = {
				bookingDate: "2024-12-25",
				slots: [
					{ startTime: "06:00", endTime: "07:00" },
					{ startTime: "07:00", endTime: "08:00" },
					{ startTime: "08:00", endTime: "09:00" },
				],
			};

			const result = await service.reserveSlot(1, reserveSlotDto, 1);

			expect(result).toBeDefined();
		});
	});
});
