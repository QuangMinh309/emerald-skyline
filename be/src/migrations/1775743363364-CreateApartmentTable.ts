import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApartmentTable1775743363364 implements MigrationInterface {
	name = "CreateApartmentTable1775743363364";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "apartment_residents" ("id" SERIAL NOT NULL, "apartment_id" integer NOT NULL, "resident_id" integer NOT NULL, "relationship" character varying NOT NULL, CONSTRAINT "PK_07cf0916d02904efb44107b450f" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "apartments" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "block_id" integer NOT NULL, "floor" integer NOT NULL, "type" character varying NOT NULL, "area" numeric(10,2), "status" character varying NOT NULL DEFAULT 'VACANT', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f6058e85d6d715dbe22b72fe722" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "apartment_residents" ADD CONSTRAINT "FK_d58968488189bdb96ad6013fbe0" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "apartment_residents" ADD CONSTRAINT "FK_67958a2ea7cb8447086047e5852" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "apartments" ADD CONSTRAINT "FK_a9b9daa7d4d7e60d3088682510d" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "apartments" DROP CONSTRAINT "FK_a9b9daa7d4d7e60d3088682510d"`,
		);
		await queryRunner.query(
			`ALTER TABLE "apartment_residents" DROP CONSTRAINT "FK_67958a2ea7cb8447086047e5852"`,
		);
		await queryRunner.query(
			`ALTER TABLE "apartment_residents" DROP CONSTRAINT "FK_d58968488189bdb96ad6013fbe0"`,
		);
		await queryRunner.query(`DROP TABLE "apartments"`);
		await queryRunner.query(`DROP TABLE "apartment_residents"`);
	}
}
