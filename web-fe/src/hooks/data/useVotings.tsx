import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { votingService } from "@/services/votings.service";
import type { VotingPayload } from "@/types/voting";

const QUERY_KEY = "votings";

export const useVotings = (params?: any) => {
	return useQuery({
		queryKey: [QUERY_KEY, params],
		queryFn: () => votingService.getAll(params),
	});
};

export const useVoting = (id: number | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEY, id],
		queryFn: () => votingService.getById(id!),
		enabled: !!id,
	});
};

export const useVotingStatistics = (id: number | undefined) => {
	return useQuery({
		queryKey: [QUERY_KEY, id, "statistics"],
		queryFn: () => votingService.getStatistics(id!),
		enabled: !!id, // Chỉ fetch khi có ID
	});
};

export const useCreateVoting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: VotingPayload) => votingService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};

export const useUpdateVoting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: any) => votingService.update(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEY, variables.id, "statistics"],
			});
		},
	});
};

export const useDeleteVoting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: votingService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};

export const useDeleteManyVotings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => votingService.deleteMany(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
		},
	});
};
