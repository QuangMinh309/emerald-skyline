import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoiceAndDetailInvoiceTable1775796541044
	implements MigrationInterface
{
	name = "CreateInvoiceAndDetailInvoiceTable1775796541044";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "invoice_details" ("id" SERIAL NOT NULL, "invoice_id" integer NOT NULL, "fee_type_id" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "unit_price" numeric(10,2), "total_price" numeric(12,2) NOT NULL, "vat_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_with_vat" numeric(12,2) NOT NULL DEFAULT '0', "calculation_breakdown" jsonb, CONSTRAINT "PK_3b7f561bae12fac5d2d0df9682b" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "invoice_code" character varying NOT NULL, "apartment_id" integer NOT NULL, "period" date NOT NULL, "subtotal_amount" numeric(12,2) NOT NULL, "vat_rate" numeric(5,2) NOT NULL DEFAULT '8', "vat_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_amount" numeric(12,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'UNPAID', "due_date" date NOT NULL DEFAULT CURRENT_DATE + INTERVAL '15 days', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_990e8735a3595990a98fb52efaf" UNIQUE ("invoice_code"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoice_details" ADD CONSTRAINT "FK_2da75e038c5b463f19965b4c739" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoice_details" ADD CONSTRAINT "FK_9ab4b44467f46afbf421ea2ec45" FOREIGN KEY ("fee_type_id") REFERENCES "fees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ADD CONSTRAINT "FK_c11634adff89762553653bc9374" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "invoices" DROP CONSTRAINT "FK_c11634adff89762553653bc9374"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoice_details" DROP CONSTRAINT "FK_9ab4b44467f46afbf421ea2ec45"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoice_details" DROP CONSTRAINT "FK_2da75e038c5b463f19965b4c739"`,
		);
		await queryRunner.query(`DROP TABLE "invoices"`);
		await queryRunner.query(`DROP TABLE "invoice_details"`);
	}
}
