import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMaintenanceTicketTable1776756154766
	implements MigrationInterface
{
	name = "CreateMaintenanceTicketTable1776756154766";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "maintenance_tickets" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" character varying NOT NULL, "priority" character varying NOT NULL DEFAULT 'MEDIUM', "description" text, "block_id" integer NOT NULL, "floor" integer NOT NULL, "asset_id" integer, "technician_id" integer, "status" character varying NOT NULL DEFAULT 'PENDING', "checklist_items" jsonb, "assigned_date" TIMESTAMP, "started_date" TIMESTAMP, "completed_date" TIMESTAMP, "result" character varying, "result_note" text, "has_issue" boolean NOT NULL DEFAULT false, "issue_detail" text, "estimated_cost" numeric(15,2), "actual_cost" numeric(15,2), "evidence_image" character varying, "evidence_video" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_6864618af429f4de6b8aede5afa" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "FK_dda88212997f6d1396db477878f" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "FK_78fc7ebe3f2272f50ad4f2a33c1" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" DROP CONSTRAINT "FK_78fc7ebe3f2272f50ad4f2a33c1"`,
		);
		await queryRunner.query(
			`ALTER TABLE "maintenance_tickets" DROP CONSTRAINT "FK_dda88212997f6d1396db477878f"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "maintenance_tickets"`);
	}
}
