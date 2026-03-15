import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getMaintenanceTickets,
	getMaintenanceTicketsByAsset,
	getMaintenanceTicketDetail,
	createIncidentTicket,
	createScheduledTicket,
	assignTechnician,
	startMaintenanceWork,
	updateMaintenanceProgress,
	completeIncidentTicket,
	completeScheduledTicket,
	updateIncidentTicket,
	updateScheduledTicket,
	cancelMaintenanceTicket,
	deleteMaintenanceTicket,
	deleteManyMaintenanceTickets,
} from "@/services/maintenances.service";
import type { TicketType } from "@/constants/ticketType";
import type { TicketStatus } from "@/constants/ticketStatus";
import type { TicketPriority } from "@/constants/ticketPriority";
import type { MaintenanceChecklistItem } from "@/types/maintenance";
import type { MaintenanceResult } from "@/constants/maintenanceResult";

const MAINTENANCE_QUERY_KEY = "maintenance-tickets";

// Get all maintenance tickets
export const useMaintenanceTickets = (params?: {
	type?: TicketType;
	status?: TicketStatus;
	priority?: TicketPriority;
	blockId?: number;
	technicianId?: number;
	assetId?: number;
}) => {
	return useQuery({
		queryKey: [MAINTENANCE_QUERY_KEY, params],
		queryFn: () => getMaintenanceTickets(params),
	});
};

// Get maintenance tickets by asset
export const useMaintenanceTicketsByAsset = (
	assetId: number,
	params?: {
		type?: TicketType;
		status?: TicketStatus;
		priority?: TicketPriority;
	},
) => {
	return useQuery({
		queryKey: [MAINTENANCE_QUERY_KEY, "asset", assetId, params],
		queryFn: () => getMaintenanceTicketsByAsset(assetId, params),
		enabled: !!assetId,
	});
};

// Get maintenance ticket detail
export const useMaintenanceTicketDetail = (id: number) => {
	return useQuery({
		queryKey: [MAINTENANCE_QUERY_KEY, id],
		queryFn: () => getMaintenanceTicketDetail(id),
		enabled: !!id,
	});
};

// Create incident ticket
export const useCreateIncidentTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createIncidentTicket,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Create scheduled ticket
export const useCreateScheduledTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createScheduledTicket,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Assign technician
export const useAssignTechnician = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: assignTechnician,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Start maintenance work
export const useStartMaintenanceWork = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: startMaintenanceWork,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Update maintenance progress
export const useUpdateMaintenanceProgress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			checklistItems,
		}: {
			id: number;
			checklistItems: MaintenanceChecklistItem[];
		}) => updateMaintenanceProgress(id, checklistItems),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Complete incident ticket
export const useCompleteIncidentTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: {
				result: MaintenanceResult;
				actualCost: number;
				resultNote?: string;
				images?: File[];
				videos?: File[];
			};
		}) => completeIncidentTicket(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Complete scheduled ticket
export const useCompleteScheduledTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: {
				result: MaintenanceResult;
				resultNote?: string;
				hasIssue?: boolean;
				issueDetail?: string;
				actualCost: number;
			};
		}) => completeScheduledTicket(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Update incident ticket
export const useUpdateIncidentTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: {
				title?: string;
				description?: string;
				priority?: TicketPriority;
				assetId?: number;
			};
		}) => updateIncidentTicket(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Update scheduled ticket
export const useUpdateScheduledTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: {
				title?: string;
				description?: string;
				assetId?: number;
				checklistItems?: MaintenanceChecklistItem[];
			};
		}) => updateScheduledTicket(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Cancel maintenance ticket
export const useCancelMaintenanceTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) =>
			cancelMaintenanceTicket(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Delete maintenance ticket
export const useDeleteMaintenanceTicket = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteMaintenanceTicket,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};

// Delete many maintenance tickets
export const useDeleteManyMaintenanceTickets = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteManyMaintenanceTickets,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MAINTENANCE_QUERY_KEY] });
		},
	});
};
