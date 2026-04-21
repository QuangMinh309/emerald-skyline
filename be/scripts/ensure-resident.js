require("dotenv").config();
const { Client } = require("pg");

const TARGET_EMAIL = process.env.SEED_RESIDENT_EMAIL || "resident@gmail.com";

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

  const account = accountRes.rows[0];

  const residentRes = await client.query(
    "SELECT id, account_id FROM residents WHERE account_id = $1 LIMIT 1",
    [account.id],
  );

  if (residentRes.rowCount > 0) {
    console.log("RESIDENT_EXISTS", JSON.stringify(residentRes.rows[0]));
    await client.end();
    return;
  }

  const suffix = Date.now().toString().slice(-6);
  const citizenId = `AUTO${suffix}`;
  const phoneNumber = `090${suffix}`;

  const insertRes = await client.query(
    `INSERT INTO residents (
      account_id, full_name, citizen_id, image_url, dob, gender,
      phone_number, nationality, province, district, ward, detail_address, is_active
    ) VALUES (
      $1, $2, $3, NULL, $4, $5,
      $6, $7, NULL, NULL, NULL, NULL, true
    ) RETURNING id, account_id, full_name`,
    [
      account.id,
      "Resident User",
      citizenId,
      "1995-01-01",
      "OTHER",
      phoneNumber,
      "Việt Nam",
    ],
  );

  console.log("RESIDENT_CREATED", JSON.stringify(insertRes.rows[0]));
  await client.end();
}

main().catch((err) => {
  console.error("ENSURE_RESIDENT_FAILED", err.message);
  process.exit(1);
});
