import { expect, type Page, test } from "@playwright/test";

const makeAuthUser = (
	role: "ADMIN" | "TECHNICIAN",
	options?: { id?: number; email?: string },
) => {
	const id = options?.id ?? 1;
	const email =
		options?.email ??
		(role === "ADMIN" ? "admin@example.com" : "tech@example.com");

	return {
		id,
		email,
		role,
		isActive: true,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	};
};

const seedAuthUser = async (
	page: Page,
	role: "ADMIN" | "TECHNICIAN",
	options?: { id?: number; email?: string },
) => {
	const user = makeAuthUser(role, options);

	await page.addInitScript((payload) => {
		localStorage.setItem("auth_user", JSON.stringify(payload));
	}, user);
};

test.describe("Auth and access flows", () => {
	test("redirects unauthenticated user from protected route to login", async ({
		page,
	}) => {
		await page.goto("/blocks");
		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
	});

	test("redirects authenticated admin away from login to profile", async ({
		page,
	}) => {
		await seedAuthUser(page, "ADMIN");

		await page.goto("/login");
		await expect(page).toHaveURL(/\/profile$/);
	});

	test("allows admin to open admin modules", async ({ page }) => {
		await seedAuthUser(page, "ADMIN");

		await page.goto("/residents");
		await expect(page).toHaveURL(/\/residents$/);

		await page.goto("/invoices");
		await expect(page).toHaveURL(/\/invoices$/);

		await page.goto("/technicians");
		await expect(page).toHaveURL(/\/technicians$/);
	});

	test("redirects technician from admin-only route to unauthorized", async ({
		page,
	}) => {
		await seedAuthUser(page, "TECHNICIAN", { id: 10 });

		await page.goto("/assets");
		await expect(page).toHaveURL(/\/unauthorized$/);
	});

	test("allows technician on shared modules and blocks admin modules", async ({
		page,
	}) => {
		await seedAuthUser(page, "TECHNICIAN", { id: 10 });

		await page.goto("/issues");
		await expect(page).toHaveURL(/\/issues$/);

		await page.goto("/maintenances");
		await expect(page).toHaveURL(/\/maintenances$/);

		await page.goto("/accounts");
		await expect(page).toHaveURL(/\/unauthorized$/);
	});
});
