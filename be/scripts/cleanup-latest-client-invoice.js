require("dotenv").config();
const { Client } = require("pg");

async function main() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false },
	});

	await client.connect();

	try {
		await client.query("BEGIN");

		const invoiceRes = await client.query(
			`SELECT id, apartment_id, period, created_at
       FROM invoices
       WHERE apartment_id = 1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,
		);

		if (invoiceRes.rowCount === 0) {
			console.log("NO_INVOICE_TO_CLEAN");
			await client.query("ROLLBACK");
			await client.end();
			return;
		}

		const invoice = invoiceRes.rows[0];

		const delDetails = await client.query(
			"DELETE FROM invoice_details WHERE invoice_id = $1",
			[invoice.id],
		);

		const delReadings = await client.query(
			"DELETE FROM meter_readings WHERE apartment_id = $1 AND billing_month = $2",
			[invoice.apartment_id, invoice.period],
		);

		const delInvoice = await client.query(
			"DELETE FROM invoices WHERE id = $1",
			[invoice.id],
		);

		await client.query("COMMIT");

		console.log(
			"CLEAN_DONE",
			JSON.stringify({
				invoiceId: invoice.id,
				apartmentId: invoice.apartment_id,
				period: invoice.period,
				deletedInvoiceRows: delInvoice.rowCount,
				deletedDetailsRows: delDetails.rowCount,
				deletedMeterRows: delReadings.rowCount,
			}),
		);
	} catch (err) {
		await client.query("ROLLBACK");
		throw err;
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error("CLEAN_FAILED", err.message);
	process.exit(1);
});
