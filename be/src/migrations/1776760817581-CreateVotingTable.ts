import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVotingTable1776760817581 implements MigrationInterface {
	name = "CreateVotingTable1776760817581";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "resident_options" ("id" SERIAL NOT NULL, "resident_id" integer NOT NULL, "option_id" integer NOT NULL, "voting_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uk_resident_voting" UNIQUE ("resident_id", "voting_id"), CONSTRAINT "PK_c7dfe84298a91ad341265ec32bb" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_voting_id" ON "resident_options" ("voting_id") `,
		);
		await queryRunner.query(
			`CREATE TABLE "options" ("id" SERIAL NOT NULL, "voting_id" integer NOT NULL, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_d232045bdb5c14d932fba18d957" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "votings" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "target_scope" character varying NOT NULL DEFAULT 'ALL', "is_required" boolean NOT NULL DEFAULT false, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "file_urls" json, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d44f8534b8c53dd3e68071ad099" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" ADD CONSTRAINT "FK_9b683e739fa3f9953f2706cc92c" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" ADD CONSTRAINT "FK_ddb1d93995c685b36fc04994cc4" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" ADD CONSTRAINT "FK_19b2233e5885ec556dba4ea7dd5" FOREIGN KEY ("voting_id") REFERENCES "votings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "options" ADD CONSTRAINT "FK_3aada8654971f73ce54c550cc6a" FOREIGN KEY ("voting_id") REFERENCES "votings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "options" DROP CONSTRAINT "FK_3aada8654971f73ce54c550cc6a"`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" DROP CONSTRAINT "FK_19b2233e5885ec556dba4ea7dd5"`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" DROP CONSTRAINT "FK_ddb1d93995c685b36fc04994cc4"`,
		);
		await queryRunner.query(
			`ALTER TABLE "resident_options" DROP CONSTRAINT "FK_9b683e739fa3f9953f2706cc92c"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "votings"`);
		await queryRunner.query(`DROP TABLE "options"`);
		await queryRunner.query(`DROP INDEX "public"."idx_voting_id"`);
		await queryRunner.query(`DROP TABLE "resident_options"`);
	}
}
