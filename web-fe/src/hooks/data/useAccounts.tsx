import {
	createAccount,
	deleteAccount,
	deleteManyAccounts,
	getAccountById,
	getAccounts,
	restoreAccount,
	updateAccount,
} from "@/services/accounts.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAccounts = (params?: {
	search?: string;
	role?: string;
	isActive?: boolean;
}) => {
	return useQuery({
		queryKey: ["accounts", params],
		queryFn: () => getAccounts(params),
	});
};

export const useGetAccountById = (id: number) => {
	return useQuery({
		queryKey: ["account", id],
		queryFn: () => getAccountById(id),
		enabled: !!id,
	});
};

export const useCreateAccount = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};

export const useUpdateAccount = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			queryClient.invalidateQueries({ queryKey: ["account"] });
		},
	});
};

export const useDeleteAccount = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};

export const useDeleteManyAccounts = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyAccounts(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};

export const useRestoreAccount = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restoreAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};
