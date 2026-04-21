import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "../../accounts/entities/account.entity";
import { Notification } from "./notification.entity";

@Entity("user_notifications")
export class UserNotification {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: "account_id" })
	accountId: number;

	@Column({ name: "notification_id" })
	notificationId: number;

	@Column({ type: "boolean", default: false, name: "is_read" })
	isRead: boolean;

	@Column({ type: "boolean", default: false, name: "is_deleted" })
	isDeleted: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@ManyToOne(() => Notification)
	@JoinColumn({ name: "notification_id" })
	notification: Notification;

	@ManyToOne(() => Account)
	@JoinColumn({ name: "account_id" })
	account: Account;
}
