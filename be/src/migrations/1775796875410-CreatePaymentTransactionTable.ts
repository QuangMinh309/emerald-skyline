import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTransactionTable1775796875410
	implements MigrationInterface
{
	name = "CreatePaymentTransactionTable1775796875410";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "payment_transactions" ("id" SERIAL NOT NULL, "txn_ref" character varying NOT NULL, "target_type" character varying NOT NULL, "target_id" integer NOT NULL, "account_id" integer NOT NULL, "amount" numeric(15,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'VND', "payment_method" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "gateway_txn_id" character varying, "gateway_response_code" character varying, "raw_log" jsonb, "description" text, "payment_url" character varying, "expires_at" TIMESTAMP, "retry_count" integer NOT NULL DEFAULT '0', "pay_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_17e93eb6ef433708652f52a0555" UNIQUE ("txn_ref"), CONSTRAINT "PK_d32b3c6b0d2c1d22604cbcc8c49" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_793ecc8596ca290a6a399b2602b" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "payment_transactions" DROP CONSTRAINT "FK_793ecc8596ca290a6a399b2602b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "payment_transactions"`);
	}
}
