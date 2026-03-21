import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookingServiceAndServiceTable1775805046386
	implements MigrationInterface
{
	name = "CreateBookingServiceAndServiceTable1775805046386";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "services" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "open_hour" TIME NOT NULL, "close_hour" TIME NOT NULL, "image_url" character varying, "unit_price" integer NOT NULL, "unit_time_block" integer NOT NULL, "total_slot" integer NOT NULL, "type" character varying NOT NULL DEFAULT 'NORMAL', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "slot_availabilities" ("id" SERIAL NOT NULL, "service_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "remaining_slot" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05dc695a158978e03da090c8715" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "bookings" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "resident_id" integer NOT NULL, "service_id" integer NOT NULL, "booking_date" date NOT NULL, "timestamps" jsonb NOT NULL, "unit_price" integer NOT NULL, "total_price" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9add00bfd42ae2bbe830bab9aa2" UNIQUE ("code"), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "booking_payments" ("id" SERIAL NOT NULL, "booking_id" integer NOT NULL, "amount" integer NOT NULL, "method" character varying NOT NULL, "note" text, "paid_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f54ffc7dfddb70234fb53a97a9" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT CURRENT_DATE + INTERVAL '15 days'`,
		);
		await queryRunner.query(
			`ALTER TABLE "slot_availabilities" ADD CONSTRAINT "FK_b1fef042b4c78c06bd0c6849e31" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "bookings" ADD CONSTRAINT "FK_761e21f31b4d3962e97f60636cd" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "booking_payments" ADD CONSTRAINT "FK_afaa5733b05d8844072d5107eae" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "booking_payments" DROP CONSTRAINT "FK_afaa5733b05d8844072d5107eae"`,
		);
		await queryRunner.query(
			`ALTER TABLE "bookings" DROP CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2"`,
		);
		await queryRunner.query(
			`ALTER TABLE "bookings" DROP CONSTRAINT "FK_761e21f31b4d3962e97f60636cd"`,
		);
		await queryRunner.query(
			`ALTER TABLE "slot_availabilities" DROP CONSTRAINT "FK_b1fef042b4c78c06bd0c6849e31"`,
		);
		await queryRunner.query(
			`ALTER TABLE "invoices" ALTER COLUMN "due_date" SET DEFAULT (CURRENT_DATE + '15 days')`,
		);
		await queryRunner.query(`DROP TABLE "booking_payments"`);
		await queryRunner.query(`DROP TABLE "bookings"`);
		await queryRunner.query(`DROP TABLE "slot_availabilities"`);
		await queryRunner.query(`DROP TABLE "services"`);
	}
}
