import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTechnicianTable1776756556895 implements MigrationInterface {
	name = "CreateTechnicianTable1776756556895";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "technicians" ("id" SERIAL NOT NULL, "full_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'AVAILABLE', "description" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b14514b23605f79475be53065b3" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "FK_64fbb7bc8e5fb03f466b161e21b" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" DROP CONSTRAINT "FK_64fbb7bc8e5fb03f466b161e21b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "technicians"`);
	}
}
