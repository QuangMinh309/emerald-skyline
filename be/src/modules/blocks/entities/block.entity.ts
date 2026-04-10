import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Apartment } from "../../apartments/entities/apartment.entity";
import { BlockStatus } from "../enums/block-status.enum";

@Entity("blocks")
export class Block {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", nullable: false })
	name: string;

	@Column({ type: "varchar", nullable: true, name: "manager_name" })
	managerName: string;

	@Column({ type: "varchar", nullable: true, name: "manager_phone" })
	managerPhone: string;

	@Column({ type: "int", nullable: true, name: "total_floors" })
	totalFloors: number;

	@Column({
		type: "varchar",
		default: BlockStatus.OPERATING,
		nullable: false,
	})
	status: BlockStatus;

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive: boolean;

	@OneToMany(
		() => Apartment,
		(apartment) => apartment.block,
	)
	apartments: Apartment[];

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
