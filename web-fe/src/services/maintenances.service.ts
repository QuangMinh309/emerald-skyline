import type { MaintenanceResult } from "@/constants/maintenanceResult";
import type { TicketPriority } from "@/constants/ticketPriority";
import type { TicketStatus } from "@/constants/ticketStatus";
import type { TicketType } from "@/constants/ticketType";
import axiosInstance from "@/lib/axios";
import type {
	MaintenanceChecklistItem,
	MaintenanceTicketDetail,
	MaintenanceTicketListItem,
} from "@/types/maintenance";

export const getMaintenanceTickets = async (params?: {
	type?: TicketType;
	status?: TicketStatus;
	priority?: TicketPriority;
	blockId?: number;
	technicianId?: number;
	assetId?: number;
}) => {
	const res = await axiosInstance.get("/maintenance-tickets", { params });
	return res.data.data as MaintenanceTicketListItem[];
};
export const getMaintenanceTicketsByAsset = async (
	assetId: number,
	params?: {
		type?: TicketType;
		status?: TicketStatus;
		priority?: TicketPriority;
	},
) => {
	const res = await axiosInstance.get(
		`/maintenance-tickets/assets/${assetId}`,
		{ params },
	);
	return res.data.data as MaintenanceTicketListItem[];
};
export const getMaintenanceTicketDetail = async (id: number) => {
	const res = await axiosInstance.get(`/maintenance-tickets/${id}`);
	return res.data.data as MaintenanceTicketDetail;
};
export const createIncidentTicket = async (data: {
	title: string;
	description?: string;
	type: TicketType; // INCIDENT
	priority?: TicketPriority;
	assetId: number;
}) => {
	const res = await axiosInstance.post("/maintenance-tickets/incident", data);
	return res.data.data as MaintenanceTicketDetail;
};

export const createScheduledTicket = async (data: {
	title: string;
	description?: string;
	type: TicketType; // MAINTENANCE
	assetId: number;
	checklistItems?: MaintenanceChecklistItem[];
}) => {
	const res = await axiosInstance.post("/maintenance-tickets/scheduled", data);
	return res.data.data as MaintenanceTicketDetail;
};
export const assignTechnician = async ({
	id,
	data,
}: {
	id: number;
	data: {
		technicianId: number;
		estimatedCost?: number;
	};
}) => {
	const res = await axiosInstance.post(
		`/maintenance-tickets/${id}/assign`,
		data,
	);
	return res.data.data as MaintenanceTicketDetail;
};
export const startMaintenanceWork = async (id: number) => {
	const res = await axiosInstance.post(`/maintenance-tickets/${id}/start`);
	return res.data.data as MaintenanceTicketDetail;
};

export const updateMaintenanceProgress = async (
	id: number,
	checklistItems: MaintenanceChecklistItem[],
) => {
	const res = await axiosInstance.post(`/maintenance-tickets/${id}/progress`, {
		checklistItems,
	});
	return res.data.data as MaintenanceTicketDetail;
};
export const completeIncidentTicket = async (
	id: number,
	data: {
		result: MaintenanceResult;
		actualCost: number;
		resultNote?: string;
		images?: File[];
		videos?: File[];
	},
) => {
	const formData = new FormData();
	formData.append("result", data.result);
	formData.append("actualCost", data.actualCost.toString());
	if (data.resultNote) {
		formData.append("resultNote", data.resultNote);
	}
	if (data.images && data.images.length > 0) {
		data.images.forEach((image) => {
			formData.append("images", image);
		});
	}
	if (data.videos && data.videos.length > 0) {
		data.videos.forEach((video) => {
			formData.append("videos", video);
		});
	}
	const res = await axiosInstance.post(
		`/maintenance-tickets/incident/${id}/complete`,
		data,
		{
			headers: { "Content-Type": "multipart/form-data" },
		},
	);
	return res.data.data as MaintenanceTicketDetail;
};
export const completeScheduledTicket = async (
	id: number,
	data: {
		result: MaintenanceResult;
		resultNote?: string;
		hasIssue?: boolean;
		issueDetail?: string;
		actualCost: number;
	},
) => {
	const res = await axiosInstance.post(
		`/maintenance-tickets/scheduled/${id}/complete`,
		data,
	);
	return res.data.data as MaintenanceTicketDetail;
};
export const updateIncidentTicket = async (
	id: number,
	data: {
		title?: string;
		description?: string;
		priority?: TicketPriority;
		assetId?: number;
	},
) => {
	const res = await axiosInstance.patch(
		`/maintenance-tickets/incident/${id}`,
		data,
	);
	return res.data.data as MaintenanceTicketDetail;
};

export const updateScheduledTicket = async (
	id: number,
	data: {
		title?: string;
		description?: string;
		assetId?: number;
		checklistItems?: MaintenanceChecklistItem[];
	},
) => {
	const res = await axiosInstance.patch(
		`/maintenance-tickets/scheduled/${id}`,
		data,
	);
	return res.data.data as MaintenanceTicketDetail;
};
export const cancelMaintenanceTicket = async (id: number, reason: string) => {
	const res = await axiosInstance.post(`/maintenance-tickets/${id}/cancel`, {
		reason,
	});
	return res.data.data as MaintenanceTicketDetail;
};

export const deleteMaintenanceTicket = async (id: number) => {
	const res = await axiosInstance.delete(`/maintenance-tickets/${id}`);
	return res.data.data as { message: string };
};

export const deleteManyMaintenanceTickets = async (ids: number[]) => {
	const res = await axiosInstance.delete(`/maintenance-tickets/batch/delete`, {
		data: { ids },
	});
	return res.data.data as {
		message: string;
		deletedIds: number[];
	};
};
