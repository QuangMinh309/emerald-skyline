import type { MaintenanceResult } from "@/constants/maintenanceResult";
import type { TicketPriority } from "@/constants/ticketPriority";
import type { TicketStatus } from "@/constants/ticketStatus";
import type { TicketType } from "@/constants/ticketType";

export interface MaintenanceTicketListItem {
	id: number;
	title: string;
	type: TicketType;
	priority: TicketPriority;
	status: TicketStatus;

	assetName?: string;
	blockName?: string;
	floor: number;

	technicianName?: string;
	createdAt: string;
}

export interface MaintenanceTicketDetail {
	id: number;
	title: string;
	type: TicketType;
	priority: TicketPriority;
	description?: string;

	status: TicketStatus;

	blockId: number;
	blockName?: string;
	floor: number;

	assetId?: number;
	assetName?: string;
	assetTypeName?: string;
	locationDetail?: string;

	technicianId?: number;
	technicianName?: string;
	technicianPhone?: string;

	checklistItems?: MaintenanceChecklistItem[];

	assignedDate?: string;
	startedDate?: string;
	completedDate?: string;

	result?: MaintenanceResult;
	resultNote?: string;
	hasIssue?: boolean;
	issueDetail?: string;

	estimatedCost?: number;
	actualCost?: number;

	createdAt: string;
}

export interface MaintenanceChecklistItem {
	task: string;
	isChecked: boolean;
}
