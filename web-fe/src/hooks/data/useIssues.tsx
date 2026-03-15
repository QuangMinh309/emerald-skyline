import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { issueService } from "@/services/issues.service";
import type { UpdateIssuePayload, IssueStatus, IssueType } from "@/types/issue";

const QUERY_KEY = "issues";

export const useIssues = (params?: {
	status?: IssueStatus;
	type?: IssueType;
	blockId?: number;
	isUrgent?: boolean;
}) => {
	return useQuery({
		queryKey: [QUERY_KEY, params],
		queryFn: () => issueService.getAll(params),
	});
};

export const useIssue = (id: number) => {
	return useQuery({
		queryKey: [QUERY_KEY, id],
		queryFn: () => issueService.getById(id),
		enabled: !!id,
	});
};

export const useUpdateIssue = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateIssuePayload }) =>
			issueService.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
		},
	});
};

export const useRejectIssue = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) =>
			issueService.reject(id, reason),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
		},
	});
};

export const useAssignTechnicianDepartment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => issueService.assignTechnicianDepartment(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
		},
	});
};
