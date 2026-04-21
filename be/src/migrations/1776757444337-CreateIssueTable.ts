import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIssueTable1776757444337 implements MigrationInterface {
	name = "CreateIssueTable1776757444337";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "issues" ("id" SERIAL NOT NULL, "reporter_id" integer NOT NULL, "type" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "block_id" integer, "floor" integer, "detail_location" character varying, "file_urls" character varying array NOT NULL DEFAULT '{}', "status" character varying NOT NULL DEFAULT 'PENDING', "rating" integer, "feedback" text, "rejection_reason" text, "is_urgent" boolean NOT NULL DEFAULT false, "estimated_completion_date" TIMESTAMP, "maintenance_ticket_id" integer, "assigned_to_technician_department" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d8ecbbeff46229c700f0449257" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "issues" ADD CONSTRAINT "FK_394a6ced54c634dfadea1618d2a" FOREIGN KEY ("reporter_id") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "issues" ADD CONSTRAINT "FK_7c47f12f36623276a4533220254" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "issues" ADD CONSTRAINT "FK_23b65be14862fef0856860d4e65" FOREIGN KEY ("maintenance_ticket_id") REFERENCES "maintenance_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "issues" DROP CONSTRAINT "FK_23b65be14862fef0856860d4e65"`,
		);
		await queryRunner.query(
			`ALTER TABLE "issues" DROP CONSTRAINT "FK_7c47f12f36623276a4533220254"`,
		);
		await queryRunner.query(
			`ALTER TABLE "issues" DROP CONSTRAINT "FK_394a6ced54c634dfadea1618d2a"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "issues"`);
	}
}
