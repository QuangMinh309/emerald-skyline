import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssetTable1776754782470 implements MigrationInterface {
	name = "CreateAssetTable1776754782470";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "assets" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type_id" integer NOT NULL, "block_id" integer NOT NULL, "floor" integer NOT NULL, "location_detail" character varying, "status" character varying NOT NULL DEFAULT 'ACTIVE', "installation_date" date, "warranty_years" integer, "warranty_expiration_date" date, "maintenance_interval_months" integer, "last_maintenance_date" date, "next_maintenance_date" date, "description" text, "note" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "assets" ADD CONSTRAINT "FK_7126d40b8466efb8375216d6d02" FOREIGN KEY ("type_id") REFERENCES "asset_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "assets" ADD CONSTRAINT "FK_8d70676dfa1eb3bea4e6963df50" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "assets" DROP CONSTRAINT "FK_8d70676dfa1eb3bea4e6963df50"`,
		);
		await queryRunner.query(
			`ALTER TABLE "assets" DROP CONSTRAINT "FK_7126d40b8466efb8375216d6d02"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "assets"`);
	}
}
