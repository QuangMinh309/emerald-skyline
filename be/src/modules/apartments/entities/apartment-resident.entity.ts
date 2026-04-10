import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Resident } from "../../residents/entities/resident.entity";
import { RelationshipType } from "../enums/relationship-type.enum";
import { Apartment } from "./apartment.entity";

@Entity("apartment_residents")
export class ApartmentResident {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "int", nullable: false, name: "apartment_id" })
	apartmentId: number;

	@ManyToOne(
		() => Apartment,
		(apartment) => apartment.apartmentResidents,
		{
			onDelete: "CASCADE",
		},
	)
	@JoinColumn({ name: "apartment_id" })
	apartment: Apartment;

	@Column({ type: "int", nullable: false, name: "resident_id" })
	residentId: number;

	@ManyToOne(() => Resident)
	@JoinColumn({ name: "resident_id" })
	resident: Resident;

	@Column({ type: "varchar", nullable: false })
	relationship: RelationshipType;
}
