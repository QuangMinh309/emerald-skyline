require("dotenv").config();
const { Client } = require("pg");

const TARGET_EMAIL = process.env.SEED_RESIDENT_EMAIL || "resident@gmail.com";

const DEMO_RESIDENT = {
	fullName: "Nguyen Minh An",
	citizenId: "079205001234",
	dob: "1995-08-15",
	gender: "MALE",
	phoneNumber: "0901234567",
	nationality: "Viet Nam",
	province: "Thanh pho Ho Chi Minh",
	district: "Quan 7",
	ward: "Phuong Tan Phu",
	detailAddress: "Emerald Tower, 88 Nguyen Luong Bang",
};

const DEMO_BLOCK = {
	name: "Emerald Tower A",
	managerName: "Le Thi Huong",
	managerPhone: "0911222333",
	totalFloors: 25,
	status: "OPERATING",
	isActive: true,
};

const DEMO_APARTMENT = {
	name: "A-1208",
	floor: 12,
	type: "TWO_BEDROOM",
	area: 78.5,
	status: "OCCUPIED",
	isActive: true,
};

async function ensureResident(client, accountId) {
	const existingResident = await client.query(
		"SELECT id, account_id FROM residents WHERE account_id = $1 LIMIT 1",
		[accountId],
	);

	let residentId;

	if (existingResident.rowCount === 0) {
		const insert = await client.query(
			`INSERT INTO residents (
        account_id, full_name, citizen_id, image_url, dob, gender, phone_number,
        nationality, province, district, ward, detail_address, is_active
      ) VALUES (
        $1, $2, $3, NULL, $4, $5, $6,
        $7, $8, $9, $10, $11, true
      ) RETURNING id`,
			[
				accountId,
				DEMO_RESIDENT.fullName,
				DEMO_RESIDENT.citizenId,
				DEMO_RESIDENT.dob,
				DEMO_RESIDENT.gender,
				DEMO_RESIDENT.phoneNumber,
				DEMO_RESIDENT.nationality,
				DEMO_RESIDENT.province,
				DEMO_RESIDENT.district,
				DEMO_RESIDENT.ward,
				DEMO_RESIDENT.detailAddress,
			],
		);
		residentId = insert.rows[0].id;
	} else {
		residentId = existingResident.rows[0].id;

		// Avoid citizen_id conflict with other resident rows.
		const conflict = await client.query(
			"SELECT id FROM residents WHERE citizen_id = $1 AND id <> $2 LIMIT 1",
			[DEMO_RESIDENT.citizenId, residentId],
		);

		const safeCitizenId =
			conflict.rowCount > 0
				? `07920500${String(residentId).padStart(4, "0")}`
				: DEMO_RESIDENT.citizenId;

		await client.query(
			`UPDATE residents
       SET full_name = $1,
           citizen_id = $2,
           dob = $3,
           gender = $4,
           phone_number = $5,
           nationality = $6,
           province = $7,
           district = $8,
           ward = $9,
           detail_address = $10,
           is_active = true,
           updated_at = NOW()
       WHERE id = $11`,
			[
				DEMO_RESIDENT.fullName,
				safeCitizenId,
				DEMO_RESIDENT.dob,
				DEMO_RESIDENT.gender,
				DEMO_RESIDENT.phoneNumber,
				DEMO_RESIDENT.nationality,
				DEMO_RESIDENT.province,
				DEMO_RESIDENT.district,
				DEMO_RESIDENT.ward,
				DEMO_RESIDENT.detailAddress,
				residentId,
			],
		);
	}

	return residentId;
}

async function ensureBlock(client) {
	const existingBlock = await client.query(
		"SELECT id FROM blocks ORDER BY id ASC LIMIT 1",
	);

	if (existingBlock.rowCount === 0) {
		const insert = await client.query(
			`INSERT INTO blocks (
        name, manager_name, manager_phone, total_floors, status, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
			[
				DEMO_BLOCK.name,
				DEMO_BLOCK.managerName,
				DEMO_BLOCK.managerPhone,
				DEMO_BLOCK.totalFloors,
				DEMO_BLOCK.status,
				DEMO_BLOCK.isActive,
			],
		);
		return insert.rows[0].id;
	}

	const blockId = existingBlock.rows[0].id;

	await client.query(
		`UPDATE blocks
     SET name = $1,
         manager_name = $2,
         manager_phone = $3,
         total_floors = $4,
         status = $5,
         is_active = $6,
         updated_at = NOW()
     WHERE id = $7`,
		[
			DEMO_BLOCK.name,
			DEMO_BLOCK.managerName,
			DEMO_BLOCK.managerPhone,
			DEMO_BLOCK.totalFloors,
			DEMO_BLOCK.status,
			DEMO_BLOCK.isActive,
			blockId,
		],
	);

	return blockId;
}

async function ensureApartment(client, blockId) {
	const existingApartment = await client.query(
		"SELECT id FROM apartments WHERE block_id = $1 ORDER BY id ASC LIMIT 1",
		[blockId],
	);

	if (existingApartment.rowCount === 0) {
		const insert = await client.query(
			`INSERT INTO apartments (
        name, block_id, floor, type, area, status, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
			[
				DEMO_APARTMENT.name,
				blockId,
				DEMO_APARTMENT.floor,
				DEMO_APARTMENT.type,
				DEMO_APARTMENT.area,
				DEMO_APARTMENT.status,
				DEMO_APARTMENT.isActive,
			],
		);
		return insert.rows[0].id;
	}

	const apartmentId = existingApartment.rows[0].id;

	await client.query(
		`UPDATE apartments
     SET name = $1,
         block_id = $2,
         floor = $3,
         type = $4,
         area = $5,
         status = $6,
         is_active = $7
     WHERE id = $8`,
		[
			DEMO_APARTMENT.name,
			blockId,
			DEMO_APARTMENT.floor,
			DEMO_APARTMENT.type,
			DEMO_APARTMENT.area,
			DEMO_APARTMENT.status,
			DEMO_APARTMENT.isActive,
			apartmentId,
		],
	);

	return apartmentId;
}

async function ensureRelationship(client, residentId, apartmentId) {
	await client.query("DELETE FROM apartment_residents WHERE resident_id = $1", [
		residentId,
	]);

	const insert = await client.query(
		`INSERT INTO apartment_residents (apartment_id, resident_id, relationship)
     VALUES ($1, $2, $3)
     RETURNING id, apartment_id, resident_id, relationship`,
		[apartmentId, residentId, "OWNER"],
	);

	return insert.rows[0];
}

async function main() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	});

	await client.connect();

	try {
		await client.query("BEGIN");

		const account = await client.query(
			"SELECT id, email FROM accounts WHERE email = $1 LIMIT 1",
			[TARGET_EMAIL],
		);

		if (account.rowCount === 0) {
			throw new Error(`Account not found for email: ${TARGET_EMAIL}`);
		}

		const accountId = account.rows[0].id;
		const residentId = await ensureResident(client, accountId);
		const blockId = await ensureBlock(client);
		const apartmentId = await ensureApartment(client, blockId);
		const relation = await ensureRelationship(client, residentId, apartmentId);

		const preview = await client.query(
			`SELECT
         r.id AS resident_id,
         r.full_name,
         r.phone_number,
         r.province,
         r.district,
         r.ward,
         a.id AS apartment_id,
         a.name AS apartment_name,
         a.floor,
         a.type,
         a.area,
         a.status,
         b.name AS block_name,
         ar.relationship
       FROM residents r
       JOIN apartment_residents ar ON ar.resident_id = r.id
       JOIN apartments a ON a.id = ar.apartment_id
       JOIN blocks b ON b.id = a.block_id
       WHERE r.id = $1`,
			[residentId],
		);

		await client.query("COMMIT");

		console.log("DEMO_SEED_DONE");
		console.log("ACCOUNT_ID", accountId);
		console.log("RESIDENT_ID", residentId);
		console.log("BLOCK_ID", blockId);
		console.log("APARTMENT_ID", apartmentId);
		console.log("RELATION", JSON.stringify(relation));
		console.log("PREVIEW", JSON.stringify(preview.rows[0]));
	} catch (err) {
		await client.query("ROLLBACK");
		throw err;
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error("SEED_DEMO_FAILED", err.message);
	process.exit(1);
});
