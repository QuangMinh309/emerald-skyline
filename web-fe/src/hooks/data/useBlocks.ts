import {
	createBlock,
	deleteBlock,
	getBlockById,
	getBlocks,
	updateBlock,
} from "@/services/blocks.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBlocks = () => {
	return useQuery({
		queryKey: ["blocks"],
		queryFn: getBlocks,
	});
};

export const useGetBlockById = (id: number) => {
	return useQuery({
		queryKey: ["block", id],
		queryFn: () => getBlockById(id),
		enabled: !!id,
	});
};

export const useCreateBlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBlock,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocks"] });
		},
	});
};

export const useUpdateBlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateBlock,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocks"] });
			queryClient.invalidateQueries({ queryKey: ["block"] });
		},
	});
};

export const useDeleteBlock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteBlock,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocks"] });
		},
	});
};
