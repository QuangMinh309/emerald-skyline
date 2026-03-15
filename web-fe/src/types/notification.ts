export type NotificationType =
	| "MAINTENANCE"
	| "POLICY"
	| "WARNING"
	| "GENERAL"
	| "OTHER";
export type TargetScope = "ALL" | "BLOCK" | "FLOOR";
export type NotificationChannel = "APP" | "EMAIL";

export interface BlockInfo {
	id: number;
	name: string;
	totalFloors?: number;
}

export interface TargetBlockConfig {
	id?: number;
	blockId: number;
	block?: BlockInfo;
	targetFloorNumbers: string[];
}

export interface NotificationData {
	id: number;
	title: string;
	content: string;
	type: NotificationType;
	isUrgent: boolean;
	channels: string[];
	fileUrls: string[];
	targetScope: TargetScope;
	targetBlocks: TargetBlockConfig[];
	isActive: boolean;
	publishedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationPayload {
	title: string;
	content: string;
	type: string;
	isUrgent: boolean;
	channels: string[];
	targetScope: string;
	publishedAt: Date;
	targetBlocks: {
		blockId: number;
		targetFloorNumbers: string[];
	}[];
	files?: File[];
}
