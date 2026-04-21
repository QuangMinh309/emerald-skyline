require("dotenv").config();
const { Client } = require("pg");

const TARGET_EMAIL = process.env.SEED_RESIDENT_EMAIL || "resident@gmail.com";
const TARGET_APARTMENT_ID = Number(process.env.SEED_APARTMENT_ID || 1);
const RELATIONSHIP = process.env.SEED_RELATIONSHIP || "OWNER";

async function main() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	});

	await client.connect();

	const accountRes = await client.query(
		"SELECT id, email FROM accounts WHERE email = $1 LIMIT 1",
		[TARGET_EMAIL],
	);

	if (accountRes.rowCount === 0) {
		console.log("ACCOUNT_NOT_FOUND", TARGET_EMAIL);
		await client.end();
		process.exit(1);
	}

	const accountId = accountRes.rows[0].id;

	const residentRes = await client.query(
		"SELECT id, account_id, full_name FROM residents WHERE account_id = $1 LIMIT 1",
		[accountId],
	);

	if (residentRes.rowCount === 0) {
		console.log("RESIDENT_NOT_FOUND_FOR_ACCOUNT", accountId);
		await client.end();
		process.exit(1);
	}

	const resident = residentRes.rows[0];

	const apartmentRes = await client.query(
		"SELECT id, name, status FROM apartments WHERE id = $1 LIMIT 1",
		[TARGET_APARTMENT_ID],
	);

	if (apartmentRes.rowCount === 0) {
		console.log("APARTMENT_NOT_FOUND", TARGET_APARTMENT_ID);
		await client.end();
		process.exit(1);
	}

	const existingRelation = await client.query(
		"SELECT id, apartment_id, resident_id, relationship FROM apartment_residents WHERE apartment_id = $1 AND resident_id = $2 LIMIT 1",
		[TARGET_APARTMENT_ID, resident.id],
	);

	if (existingRelation.rowCount > 0) {
		console.log("RELATION_EXISTS", JSON.stringify(existingRelation.rows[0]));
	} else {
		const insertRes = await client.query(
			"INSERT INTO apartment_residents (apartment_id, resident_id, relationship) VALUES ($1, $2, $3) RETURNING id, apartment_id, resident_id, relationship",
			[TARGET_APARTMENT_ID, resident.id, RELATIONSHIP],
		);
		console.log("RELATION_CREATED", JSON.stringify(insertRes.rows[0]));
	}

	await client.query("UPDATE apartments SET status = $1 WHERE id = $2", [
		"OCCUPIED",
		TARGET_APARTMENT_ID,
	]);

	const verifyRes = await client.query(
		"SELECT ar.id, ar.relationship, a.id AS apartment_id, a.name AS apartment_name, a.status AS apartment_status FROM apartment_residents ar JOIN apartments a ON a.id = ar.apartment_id WHERE ar.resident_id = $1",
		[resident.id],
	);

	console.log("VERIFY_RELATIONS", JSON.stringify(verifyRes.rows));

	await client.end();
}

main().catch((err) => {
	console.error("ENSURE_RESIDENT_APARTMENT_FAILED", err.message);
	process.exit(1);
});
