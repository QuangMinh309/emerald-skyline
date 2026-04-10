import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMeterReadingTable1775747403295
	implements MigrationInterface
{
	name = "CreateMeterReadingTable1775747403295";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "meter_readings" ("id" SERIAL NOT NULL, "apartment_id" integer NOT NULL, "fee_type_id" integer NOT NULL, "reading_date" date NOT NULL, "billing_month" date NOT NULL, "old_index" numeric(10,2) NOT NULL, "new_index" numeric(10,2) NOT NULL, "usage_amount" numeric(10,2) NOT NULL, "image_proof_url" character varying, "is_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e1a17bbc8bfc32c9d70adc7c2bc" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "meter_readings" ADD CONSTRAINT "FK_3aed4139a110cf7a33ecc515b8a" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "meter_readings" ADD CONSTRAINT "FK_b3afc1956345a987e4289ed76f6" FOREIGN KEY ("fee_type_id") REFERENCES "fees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "meter_readings" DROP CONSTRAINT "FK_b3afc1956345a987e4289ed76f6"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meter_readings" DROP CONSTRAINT "FK_3aed4139a110cf7a33ecc515b8a"`,
		);
		await queryRunner.query(`DROP TABLE "meter_readings"`);
	}
}
