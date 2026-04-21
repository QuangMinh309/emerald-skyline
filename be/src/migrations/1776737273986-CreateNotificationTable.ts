import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1776737273986
	implements MigrationInterface
{
	name = "CreateNotificationTable1776737273986";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."system_notifications_type_enum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM')`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."system_notifications_priority_enum" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT')`,
		);
		await queryRunner.query(
			`CREATE TABLE "system_notifications" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "type" "public"."system_notifications_type_enum" NOT NULL DEFAULT 'INFO', "priority" "public"."system_notifications_priority_enum" NOT NULL DEFAULT 'NORMAL', "target_user_ids" text, "metadata" jsonb, "is_sent" boolean NOT NULL DEFAULT false, "sent_at" TIMESTAMP, "scheduled_for" TIMESTAMP, "created_by" integer NOT NULL, "action_url" character varying(500), "action_text" character varying(100), "is_persistent" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2251866d2c48c1ff710e9fd444d" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_078d69f5c9f27f5db9782d29e2" ON "system_notifications" ("title") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_1069d6e69af7ceea72d2fe68d4" ON "system_notifications" ("type") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_6e20a78198d3b0220c19b86a21" ON "system_notifications" ("is_sent") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a2070ed3060eada6500b59cf40" ON "system_notifications" ("created_at") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_3cb88a61739d5be61d3a57c45d" ON "system_notifications" ("is_sent", "scheduled_for") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_846d3882bd40ebe9169cb32a50" ON "system_notifications" ("type", "created_at") `,
		);
		await queryRunner.query(
			`CREATE TABLE "system_user_notifications" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "notification_id" integer NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6f86caa34789489f459ecc693b1" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_8ac231bc66baa238788990e71d" ON "system_user_notifications" ("user_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_7b380fc49d60589ce17e9a8687" ON "system_user_notifications" ("is_read") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_4805dbb533c205a6104a88a9c6" ON "system_user_notifications" ("user_id", "created_at") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_05ade61c418df27ef86aaacf8f" ON "system_user_notifications" ("user_id", "is_read") `,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "system_user_notifications" ADD CONSTRAINT "FK_a8d2a33d62aa1255536f030f9ce" FOREIGN KEY ("notification_id") REFERENCES "system_notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "system_user_notifications" DROP CONSTRAINT "FK_a8d2a33d62aa1255536f030f9ce"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_05ade61c418df27ef86aaacf8f"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_4805dbb533c205a6104a88a9c6"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_7b380fc49d60589ce17e9a8687"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_8ac231bc66baa238788990e71d"`,
		);
		await queryRunner.query(`DROP TABLE "system_user_notifications"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_846d3882bd40ebe9169cb32a50"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_3cb88a61739d5be61d3a57c45d"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a2070ed3060eada6500b59cf40"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_6e20a78198d3b0220c19b86a21"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_1069d6e69af7ceea72d2fe68d4"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_078d69f5c9f27f5db9782d29e2"`,
		);
		await queryRunner.query(`DROP TABLE "system_notifications"`);
		await queryRunner.query(
			`DROP TYPE "public"."system_notifications_priority_enum"`,
		);
		await queryRunner.query(
			`DROP TYPE "public"."system_notifications_type_enum"`,
		);
	}
}
