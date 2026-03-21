import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeeTable1775745720651 implements MigrationInterface {
	name = "CreateFeeTable1775745720651";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "fee_tiers" ("id" SERIAL NOT NULL, "fee_type_id" integer NOT NULL, "name" character varying NOT NULL, "from_value" numeric(10,2) NOT NULL, "to_value" numeric(10,2), "unit_price" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7cdebb145b413ff03f6067063bf" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "fees" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "unit" character varying, "type" character varying NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_97f3a1b1b8ee5674fd4da93f461" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "fee_tiers" ADD CONSTRAINT "FK_2c3c438ca7ead3c7cbb152d918e" FOREIGN KEY ("fee_type_id") REFERENCES "fees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "fee_tiers" DROP CONSTRAINT "FK_2c3c438ca7ead3c7cbb152d918e"`,
		);
		await queryRunner.query(`DROP TABLE "fees"`);
		await queryRunner.query(`DROP TABLE "fee_tiers"`);
	}
}
