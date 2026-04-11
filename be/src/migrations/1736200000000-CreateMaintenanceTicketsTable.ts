import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class CreateMaintenanceTicketsTable1736200000000
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create ticket_type enum
		await queryRunner.query(`
      CREATE TYPE ticket_type AS ENUM ('INCIDENT', 'MAINTENANCE');
    `);

		// Create ticket_status enum
		await queryRunner.query(`
      CREATE TYPE ticket_status AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    `);

		// Create ticket_priority enum
		await queryRunner.query(`
      CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    `);

		// Create maintenance_result enum
		await queryRunner.query(`
      CREATE TYPE maintenance_result AS ENUM ('GOOD', 'NEEDS_REPAIR', 'MONITORING');
    `);

		// Create maintenance_tickets table
		await queryRunner.createTable(
			new Table({
				name: "maintenance_tickets",
				columns: [
					{
						name: "id",
						type: "serial",
						isPrimary: true,
					},
					{
						name: "title",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "type",
						type: "ticket_type",
						isNullable: false,
					},
					{
						name: "priority",
						type: "ticket_priority",
						isNullable: false,
						default: "'MEDIUM'",
					},
					{
						name: "description",
						type: "text",
						isNullable: true,
					},
					{
						name: "block_id",
						type: "int",
						isNullable: false,
					},
					{
						name: "floor",
						type: "int",
						isNullable: false,
					},
					{
						name: "apartment_id",
						type: "int",
						isNullable: true,
					},
					{
						name: "asset_id",
						type: "int",
						isNullable: true,
					},
					{
						name: "technician_id",
						type: "int",
						isNullable: true,
					},
					{
						name: "status",
						type: "ticket_status",
						isNullable: false,
						default: "'PENDING'",
					},
					{
						name: "checklist_items",
						type: "jsonb",
						isNullable: true,
					},
					{
						name: "assigned_date",
						type: "timestamp",
						isNullable: true,
					},
					{
						name: "started_date",
						type: "timestamp",
						isNullable: true,
					},
					{
						name: "completed_date",
						type: "timestamp",
						isNullable: true,
					},
					{
						name: "result",
						type: "maintenance_result",
						isNullable: true,
					},
					{
						name: "result_note",
						type: "text",
						isNullable: true,
					},
					{
						name: "has_issue",
						type: "boolean",
						default: false,
						isNullable: false,
					},
					{
						name: "issue_detail",
						type: "text",
						isNullable: true,
					},
					{
						name: "material_cost",
						type: "decimal",
						precision: 15,
						scale: 2,
						isNullable: true,
					},
					{
						name: "labor_cost",
						type: "decimal",
						precision: 15,
						scale: 2,
						isNullable: true,
					},
					{
						name: "total_cost",
						type: "decimal",
						precision: 15,
						scale: 2,
						isNullable: true,
					},
					{
						name: "estimated_cost",
						type: "decimal",
						precision: 15,
						scale: 2,
						isNullable: true,
					},
					{
						name: "actual_cost",
						type: "decimal",
						precision: 15,
						scale: 2,
						isNullable: true,
					},
					{
						name: "created_at",
						type: "timestamp",
						default: "now()",
					},
					{
						name: "is_active",
						type: "boolean",
						default: true,
					},
				],
			}),
			true,
		);

		// Add foreign keys
		await queryRunner.createForeignKey(
			"maintenance_tickets",
			new TableForeignKey({
				columnNames: ["block_id"],
				referencedTableName: "blocks",
				referencedColumnNames: ["id"],
				onDelete: "RESTRICT",
			}),
		);

		await queryRunner.createForeignKey(
			"maintenance_tickets",
			new TableForeignKey({
				columnNames: ["apartment_id"],
				referencedTableName: "apartments",
				referencedColumnNames: ["id"],
				onDelete: "SET NULL",
			}),
		);

		await queryRunner.createForeignKey(
			"maintenance_tickets",
			new TableForeignKey({
				columnNames: ["asset_id"],
				referencedTableName: "assets",
				referencedColumnNames: ["id"],
				onDelete: "SET NULL",
			}),
		);

		await queryRunner.createForeignKey(
			"maintenance_tickets",
			new TableForeignKey({
				columnNames: ["technician_id"],
				referencedTableName: "technicians",
				referencedColumnNames: ["id"],
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop foreign keys
		const table = await queryRunner.getTable("maintenance_tickets");
		if (table) {
			const foreignKeys = table.foreignKeys;
			for (const foreignKey of foreignKeys) {
				await queryRunner.dropForeignKey("maintenance_tickets", foreignKey);
			}
		}

		// Drop table
		await queryRunner.dropTable("maintenance_tickets");

		// Drop enums
		await queryRunner.query(`DROP TYPE IF EXISTS maintenance_result;`);
		await queryRunner.query(`DROP TYPE IF EXISTS ticket_priority;`);
		await queryRunner.query(`DROP TYPE IF EXISTS ticket_status;`);
		await queryRunner.query(`DROP TYPE IF EXISTS ticket_type;`);
	}
}
