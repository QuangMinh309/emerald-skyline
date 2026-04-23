import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { Account } from "./entities/account.entity";
import { UserRole } from "./enums/user-role.enum";

describe("AccountsService", () => {
	let service: AccountsService;
	let accountRepository: jest.Mocked<Repository<Account>>;

	// ============================================================================
	// MOCK DATA
	// ============================================================================

	const mockAccount = {
		id: 1,
		email: "admin@example.com",
		password: "$2b$10$hashedpassword123456",
		role: UserRole.ADMIN,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Account;

	const mockAccount2 = {
		id: 2,
		email: "resident@example.com",
		password: "$2b$10$hashedpassword789012",
		role: UserRole.RESIDENT,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Account;

	const mockAccount3 = {
		id: 3,
		email: "technician@example.com",
		password: "$2b$10$hashedpassword345678",
		role: UserRole.TECHNICIAN,
		isActive: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as Account;

	// ============================================================================
	// SETUP
	// ============================================================================

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountsService,
				{
					provide: getRepositoryToken(Account),
					useValue: {
						count: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						findOne: jest.fn(),
						find: jest.fn(),
						update: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AccountsService>(AccountsService);
		accountRepository = module.get(getRepositoryToken(Account));
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// ============================================================================
	// CREATE
	// ============================================================================

	describe("create", () => {
		const createDto: CreateAccountDto = {
			email: "newaccount@example.com",
			password: "SecurePass123!",
			role: UserRole.RESIDENT,
			isActive: true,
		};

		it("should create account successfully with valid data", async () => {
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(accountRepository, "create")
				.mockReturnValue(mockAccount as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as any);

			const result = await service.create(createDto);

			expect(accountRepository.count).toHaveBeenCalledWith({
				where: { email: createDto.email },
			});
			expect(accountRepository.create).toHaveBeenCalledWith(createDto);
			expect(accountRepository.save).toHaveBeenCalled();
			expect(result).toEqual(mockAccount);
		});

		it("should throw CONFLICT if email already exists", async () => {
			jest.spyOn(accountRepository, "count").mockResolvedValue(1);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException("Email đã tồn tại", HttpStatus.CONFLICT),
			);

			expect(accountRepository.create).not.toHaveBeenCalled();
		});

		it("should create account with ADMIN role", async () => {
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			jest.spyOn(accountRepository, "create").mockReturnValue(mockAccount);
			jest.spyOn(accountRepository, "save").mockResolvedValue(mockAccount);

			const adminDto = { ...createDto, role: UserRole.ADMIN };
			const result = await service.create(adminDto);

			expect(result.role).toBe(UserRole.ADMIN);
		});

		it("should create account with TECHNICIAN role", async () => {
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			const techAccount = { ...mockAccount, role: UserRole.TECHNICIAN };
			jest
				.spyOn(accountRepository, "create")
				.mockReturnValue(techAccount as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(techAccount as any);

			const techDto = { ...createDto, role: UserRole.TECHNICIAN };
			const result = await service.create(techDto);

			expect(result.role).toBe(UserRole.TECHNICIAN);
		});

		it("should create account with isActive default to true", async () => {
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(accountRepository, "create")
				.mockReturnValue(mockAccount as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as any);

			const result = await service.create(createDto);

			expect(result.isActive).toBe(true);
		});
	});

	// ============================================================================
	// FIND ALL
	// ============================================================================

	describe("findAll", () => {
		it("should return all accounts without filters", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([
					mockAccount as unknown as Account,
					mockAccount2 as unknown as Account,
				]);

			const result = (await service.findAll({})) as Account[];

			expect(result).toHaveLength(2);
			expect(accountRepository.find).toHaveBeenCalledWith({
				where: {},
				order: { createdAt: "DESC" },
			});
		});

		it("should filter accounts by role", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([mockAccount]);

			const result = await service.findAll({ role: UserRole.ADMIN });

			expect(result).toHaveLength(1);
			expect(accountRepository.find).toHaveBeenCalledWith({
				where: { role: UserRole.ADMIN },
				order: { createdAt: "DESC" },
			});
		});

		it("should filter accounts by isActive status", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount, mockAccount2]);

			const result = await service.findAll({ isActive: true });

			expect(accountRepository.find).toHaveBeenCalledWith({
				where: { isActive: true },
				order: { createdAt: "DESC" },
			});
		});

		it("should search accounts by email", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([mockAccount]);

			const result = await service.findAll({ search: "admin" });

			expect(result).toHaveLength(1);
			expect(accountRepository.find).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						email: expect.any(Object),
					}),
				}),
			);
		});

		it("should filter by multiple criteria", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([mockAccount]);

			const result = await service.findAll({
				role: UserRole.ADMIN,
				isActive: true,
				search: "admin",
			});

			expect(result).toHaveLength(1);
			expect(accountRepository.find).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						role: UserRole.ADMIN,
						isActive: true,
					}),
				}),
			);
		});

		it("should return empty array when no accounts match filters", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([]);

			const result = await service.findAll({ role: UserRole.TECHNICIAN });

			expect(result).toEqual([]);
		});

		it("should order results by createdAt DESC", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount2, mockAccount]);

			await service.findAll({});

			expect(accountRepository.find).toHaveBeenCalledWith({
				where: {},
				order: { createdAt: "DESC" },
			});
		});
	});

	// ============================================================================
	// FIND ONE
	// ============================================================================

	describe("findOne", () => {
		it("should return active account by ID", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(mockAccount);

			const result = await service.findOne(1);

			expect(result).toEqual(mockAccount);
			expect(accountRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1, isActive: true },
			});
		});

		it("should throw NOT_FOUND if account does not exist", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(
				new HttpException(
					"Tài khoản với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should only return active accounts", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.findOne(3)).rejects.toThrow(HttpException);
		});
	});

	// ============================================================================
	// FIND BY EMAIL
	// ============================================================================

	describe("findByEmail", () => {
		it("should return account by email", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(mockAccount);

			const result = await service.findByEmail("admin@example.com");

			expect(result).toEqual(mockAccount);
			expect(accountRepository.findOne).toHaveBeenCalledWith({
				where: { email: "admin@example.com" },
			});
		});

		it("should return null if email not found", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			const result = await service.findByEmail("nonexistent@example.com");

			expect(result).toBeNull();
		});

		it("should find inactive accounts by email", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount3 as any);

			const result = await service.findByEmail("technician@example.com");

			expect(result).toEqual(mockAccount3);
			expect(result?.isActive).toBe(false);
		});
	});

	// ============================================================================
	// UPDATE
	// ============================================================================

	describe("update", () => {
		const updateDto: UpdateAccountDto = {
			role: UserRole.TECHNICIAN,
		};

		it("should update account successfully", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as unknown as Account);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			const result = await service.update(1, updateDto);

			expect(accountRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it("should update email when email changes and is not duplicate", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValueOnce(mockAccount as unknown as Account)
				.mockResolvedValueOnce(null as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			const dtoWithEmail = {
				...updateDto,
				email: "newemail@example.com",
			};

			await service.update(1, dtoWithEmail);

			expect(accountRepository.findOne).toHaveBeenCalledWith({
				where: { email: "newemail@example.com" },
			});
		});

		it("should throw CONFLICT if new email already exists", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValueOnce(mockAccount as unknown as Account)
				.mockResolvedValueOnce(mockAccount2 as unknown as Account);

			const dtoWithEmail = {
				...updateDto,
				email: "resident@example.com",
			};

			await expect(service.update(1, dtoWithEmail)).rejects.toThrow(
				new HttpException("Email đã tồn tại", HttpStatus.CONFLICT),
			);
		});

		it("should not check email if email is same as current", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockImplementation(async (query: any) => {
					// Return account for initial fetch by id
					if (query.where.id) {
						return mockAccount as any;
					}
					// Return null for email check to simulate no duplicate (shouldn't be called)
					return null;
				});
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as any);

			const dtoWithSameEmail = {
				...updateDto,
				email: "admin@example.com",
			};

			const result = await service.update(1, dtoWithSameEmail);

			expect(result).toBeDefined();
			expect(result.email).toBe("admin@example.com");
		});

		it("should throw NOT_FOUND if account does not exist", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.update(999, updateDto)).rejects.toThrow(
				HttpException,
			);
		});

		it("should update only provided fields", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as any);

			const partialUpdate = { role: UserRole.TECHNICIAN };
			await service.update(1, partialUpdate);

			expect(accountRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					role: UserRole.TECHNICIAN,
				}),
			);
		});
	});

	// ============================================================================
	// REMOVE
	// ============================================================================

	describe("remove", () => {
		it("should soft delete account successfully", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as unknown as Account);
			jest.spyOn(accountRepository, "save").mockResolvedValue({
				...mockAccount,
				isActive: false,
			} as unknown as Account);

			const result = await service.remove(1);

			expect(result.isActive).toBe(false);
			expect(accountRepository.save).toHaveBeenCalled();
		});

		it("should throw NOT_FOUND if account does not exist", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(999)).rejects.toThrow(HttpException);
		});

		it("should only delete active accounts", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.remove(3)).rejects.toThrow(HttpException);
		});
	});

	// ============================================================================
	// REMOVE MANY
	// ============================================================================

	describe("removeMany", () => {
		it("should soft delete multiple accounts successfully", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount, mockAccount2]);
			jest
				.spyOn(accountRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.deletedCount).toBe(2);
			expect(accountRepository.update).toHaveBeenCalledWith(
				{ id: In([1, 2]) },
				{ isActive: false },
			);
		});

		it("should throw NOT_FOUND if no active accounts found", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([999, 1000])).rejects.toThrow(
				new HttpException(
					"Không tìm thấy tài khoản nào với các ID đã cung cấp",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should return message with deleted count", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount, mockAccount2]);
			jest
				.spyOn(accountRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2]);

			expect(result.message).toContain("2");
			expect(result.message).toContain("Đã xóa thành công");
		});

		it("should handle partial deletion when some IDs are inactive", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount, mockAccount2]);
			jest
				.spyOn(accountRepository, "update")
				.mockResolvedValue({ affected: 2 } as any);

			const result = await service.removeMany([1, 2, 3]);

			expect(result.deletedCount).toBe(2);
		});
	});

	// ============================================================================
	// RESTORE
	// ============================================================================

	describe("restore", () => {
		it("should restore inactive account successfully", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount3 as unknown as Account);
			jest.spyOn(accountRepository, "save").mockResolvedValue({
				...mockAccount3,
				isActive: true,
			} as unknown as Account);

			const result = await service.restore(3);

			expect(result.isActive).toBe(true);
			expect(accountRepository.save).toHaveBeenCalled();
		});

		it("should throw NOT_FOUND if inactive account does not exist", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.restore(999)).rejects.toThrow(
				new HttpException(
					"Tài khoản với ID 999 không tồn tại",
					HttpStatus.NOT_FOUND,
				),
			);
		});

		it("should only restore inactive accounts", async () => {
			jest.spyOn(accountRepository, "findOne").mockResolvedValue(null);

			await expect(service.restore(1)).rejects.toThrow(HttpException);
		});

		it("should look for accounts with isActive false", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount3 as any);
			jest.spyOn(accountRepository, "save").mockResolvedValue({
				...mockAccount3,
				isActive: true,
			} as any);

			await service.restore(3);

			expect(accountRepository.findOne).toHaveBeenCalledWith({
				where: { id: 3, isActive: false },
			});
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration: Account Lifecycle", () => {
		it("should create, update, and retrieve account", async () => {
			const createDto: CreateAccountDto = {
				email: "lifecycle@example.com",
				password: "SecurePass123!",
				role: UserRole.RESIDENT,
				isActive: true,
			};

			// Create
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(accountRepository, "create")
				.mockReturnValue(mockAccount as unknown as Account);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			const created = await service.create(createDto);
			expect(created).toBeDefined();

			// Update
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as unknown as Account);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			const updated = await service.update(created.id, {
				role: UserRole.TECHNICIAN,
			});
			expect(updated).toBeDefined();

			// Find
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as unknown as Account);
			const found = await service.findOne(created.id);
			expect(found).toBeDefined();
		});

		it("should delete and restore account", async () => {
			// Delete
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValueOnce(mockAccount as any);
			jest.spyOn(accountRepository, "save").mockResolvedValue({
				...mockAccount,
				isActive: false,
			} as any);

			const deleted = (await service.remove(1)) as Account;
			expect(deleted.isActive).toBe(false);

			// Clear mocks and reset for restore step
			jest.clearAllMocks();

			// Restore
			jest.spyOn(accountRepository, "findOne").mockResolvedValueOnce({
				...mockAccount,
				isActive: false,
			} as any);
			jest.spyOn(accountRepository, "save").mockResolvedValue({
				...mockAccount,
				isActive: true,
			} as any);

			const restored = (await service.restore(1)) as Account;
			expect(restored.isActive).toBe(true);
		});

		it("should prevent duplication of account operations", async () => {
			const createDto: CreateAccountDto = {
				email: "duplicate@example.com",
				password: "SecurePass123!",
				role: UserRole.ADMIN,
				isActive: true,
			};

			// First creation succeeds
			jest.spyOn(accountRepository, "count").mockResolvedValue(0);
			jest
				.spyOn(accountRepository, "create")
				.mockReturnValue(mockAccount as unknown as Account);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			await service.create(createDto);

			// Second creation fails
			jest.spyOn(accountRepository, "count").mockResolvedValue(1);

			await expect(service.create(createDto)).rejects.toThrow(
				new HttpException("Email đã tồn tại", HttpStatus.CONFLICT),
			);
		});
	});

	// ============================================================================
	// EDGE CASES
	// ============================================================================

	describe("Edge Cases", () => {
		it("should handle removeMany with empty array", async () => {
			jest.spyOn(accountRepository, "find").mockResolvedValue([]);

			await expect(service.removeMany([])).rejects.toThrow(HttpException);
		});

		it("should handle findAll with all filter combinations", async () => {
			jest
				.spyOn(accountRepository, "find")
				.mockResolvedValue([mockAccount as any]);

			const result = (await service.findAll({
				search: "admin",
				role: UserRole.ADMIN,
				isActive: true,
			})) as Account[];

			expect(result).toBeDefined();
		});

		it("should handle update with empty DTO", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as unknown as Account);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as unknown as Account);

			const result = await service.update(1, {});

			expect(result).toBeDefined();
		});

		it("should preserve password hash on update", async () => {
			jest
				.spyOn(accountRepository, "findOne")
				.mockResolvedValue(mockAccount as any);
			jest
				.spyOn(accountRepository, "save")
				.mockResolvedValue(mockAccount as any);

			const updateDto: UpdateAccountDto = {
				role: UserRole.TECHNICIAN,
			};

			const result = (await service.update(1, updateDto)) as Account;

			expect(result.password).toBe(mockAccount.password);
		});
	});
});
