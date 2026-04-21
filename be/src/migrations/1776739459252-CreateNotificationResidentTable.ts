import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationResidentTable1776739459252
	implements MigrationInterface
{
	name = "CreateNotificationResidentTable1776739459252";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "target_blocks" ("id" SERIAL NOT NULL, "notification_id" integer, "voting_id" integer, "block_id" integer NOT NULL, "target_floor_numbers" text, CONSTRAINT "PK_bffca85e487a12c608846550b2b" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "type" character varying NOT NULL DEFAULT 'GENERAL', "is_urgent" boolean NOT NULL DEFAULT false, "file_urls" text, "target_scope" character varying NOT NULL DEFAULT 'ALL', "channels" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "published_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "user_notifications" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "notification_id" integer NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "is_deleted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_569622b0fd6e6ab3661de985a2b" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "target_blocks" ADD CONSTRAINT "FK_063e217a3f742aee7ac07a0efc7" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "target_blocks" ADD CONSTRAINT "FK_a719efaf593bd7ed5b54fc034c7" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_944431ae979397c8b56a99bf024" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_d79ad5adcc6c6c48dd0aff3123e" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_d79ad5adcc6c6c48dd0aff3123e"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_944431ae979397c8b56a99bf024"`,
		);
		await queryRunner.query(
			`ALTER TABLE "target_blocks" DROP CONSTRAINT "FK_a719efaf593bd7ed5b54fc034c7"`,
		);
		await queryRunner.query(
			`ALTER TABLE "target_blocks" DROP CONSTRAINT "FK_063e217a3f742aee7ac07a0efc7"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "user_notifications"`);
		await queryRunner.query(`DROP TABLE "notifications"`);
		await queryRunner.query(`DROP TABLE "target_blocks"`);
	}
}
