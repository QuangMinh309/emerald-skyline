import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { ResidentOption } from "./resident-option.entity";
import { Voting } from "./voting.entity";

@Entity("options")
export class Option {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "int", nullable: false, name: "voting_id" })
	votingId: number;

	@ManyToOne(
		() => Voting,
		(voting) => voting.options,
		{ onDelete: "CASCADE" },
	)
	@JoinColumn({ name: "voting_id" })
	voting: Voting;

	@Column({ type: "varchar", nullable: false })
	name: string;

	@Column({ type: "text", nullable: true })
	description: string;

	@OneToMany(
		() => ResidentOption,
		(residentOption) => residentOption.option,
	)
	residentOptions: ResidentOption[];
}
