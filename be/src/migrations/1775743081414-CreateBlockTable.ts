import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlockTable1775743081414 implements MigrationInterface {
	name = "CreateBlockTable1775743081414";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "blocks" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "manager_name" character varying, "manager_phone" character varying, "total_floors" integer, "status" character varying NOT NULL DEFAULT 'OPERATING', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "blocks"`);
	}
}
