import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Block } from "../../blocks/entities/block.entity";
import { ApartmentStatus } from "../enums/apartment-status.enum";
import { ApartmentType } from "../enums/apartment-type.enum";
import { ApartmentResident } from "./apartment-resident.entity";

@Entity("apartments")
export class Apartment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", nullable: false })
	name: string;

	@Column({ type: "int", nullable: false, name: "block_id" })
	blockId: number;

	@ManyToOne(
		() => Block,
		(block) => block.apartments,
	)
	@JoinColumn({ name: "block_id" })
	block: Block;

	@Column({ type: "int", nullable: false })
	floor: number;

	@Column({ type: "varchar", nullable: false })
	type: ApartmentType;

	@Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
	area: number;

	@Column({
		type: "varchar",
		default: ApartmentStatus.VACANT,
		nullable: false,
	})
	status: ApartmentStatus;

	@OneToMany(
		() => ApartmentResident,
		(apartmentResident) => apartmentResident.apartment,
		{ cascade: true },
	)
	apartmentResidents: ApartmentResident[];

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
