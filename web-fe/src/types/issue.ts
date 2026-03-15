export type IssueType =
	| "TECHNICAL"
	| "CLEANING"
	| "NOISE"
	| "SECURITY"
	| "FIRE"
	| "OTHERS";
export type IssueStatus =
	| "PENDING"
	| "RECEIVED"
	| "PROCESSING"
	| "RESOLVED"
	| "REJECTED";

export interface BlockInfo {
	id: number;
	name: string;
}

export interface ReporterInfo {
	id: number;
	fullName: string;
	phoneNumber: string;
}

export interface IssueListItem {
	id: number;
	type: IssueType;
	typeLabel: string;
	title: string;
	description?: string;
	assignedToTechnicianDepartment: boolean;
	block: BlockInfo | null;
	floor?: number;
	detailLocation?: string;
	status: IssueStatus;
	statusLabel: string;
	isUrgent: boolean;
	fileUrls: string[];
	rating?: number;
	reporter: ReporterInfo | null;
	createdAt: string;
	updatedAt: string;
}

export interface IssueDetail extends IssueListItem {
	maintenanceTicket?: {
		id: number;
		title: string;
	};
	estimatedCompletionDate?: string;
	rejectionReason?: string;
	technicianId?: number;
	technicianName?: string;
	feedback?: string;
	images?: string[];
}

export interface UpdateIssuePayload {
	status?: IssueStatus;
	isUrgent?: boolean;
	estimatedCompletionDate?: string;
	maintenanceTicketId?: number;
}
