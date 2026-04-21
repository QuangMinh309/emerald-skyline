import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssetTypeTable1776754671345 implements MigrationInterface {
	name = "CreateAssetTypeTable1776754671345";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "asset_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2cf0314bcc4351b7f2827d57edb" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "asset_types"`);
	}
}
