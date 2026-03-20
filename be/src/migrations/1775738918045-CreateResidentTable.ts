import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResidentTable1775738918045 implements MigrationInterface {
	name = "CreateResidentTable1775738918045";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "residents" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "full_name" character varying NOT NULL, "citizen_id" character varying NOT NULL, "image_url" character varying, "dob" date NOT NULL, "gender" character varying NOT NULL, "phone_number" character varying NOT NULL, "nationality" character varying NOT NULL, "province" character varying, "district" character varying, "ward" character varying, "detail_address" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fceba7e64fa5bce110f0db63e8e" UNIQUE ("account_id"), CONSTRAINT "UQ_88983b7c8906b97c01a4745a63c" UNIQUE ("citizen_id"), CONSTRAINT "REL_fceba7e64fa5bce110f0db63e8" UNIQUE ("account_id"), CONSTRAINT "PK_4c8d0413ee0e9a4ebbf500f7365" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "residents" ADD CONSTRAINT "FK_fceba7e64fa5bce110f0db63e8e" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "residents" DROP CONSTRAINT "FK_fceba7e64fa5bce110f0db63e8e"`,
		);
		await queryRunner.query(`DROP TABLE "residents"`);
	}
}
