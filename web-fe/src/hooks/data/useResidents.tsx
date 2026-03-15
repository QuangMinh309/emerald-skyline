import {
	createResident,
	deleteResident,
	deleteManyResidents,
	getResidentById,
	getResidents,
	getInvoicesAndPaymentsByResidentId,
	getResidentResidences,
	updateResident,
} from "@/services/residents.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Resident Hooks
export const useResidents = () => {
	return useQuery({
		queryKey: ["residents"],
		queryFn: getResidents,
	});
};

export const useGetResidentById = (id: number) => {
	return useQuery({
		queryKey: ["resident", id],
		queryFn: () => getResidentById(id),
		enabled: !!id,
	});
};

export const useCreateResident = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createResident,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});
};

export const useUpdateResident = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateResident,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["residents"] });
			queryClient.invalidateQueries({ queryKey: ["resident"] });
		},
	});
};

export const useDeleteResident = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteResident,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});
};

export const useDeleteManyResidents = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyResidents(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});
};

export const useGetInvoicesAndPaymentsByResidentId = (id: number) => {
	return useQuery({
		queryKey: ["resident-invoices-payments", id],
		queryFn: () => getInvoicesAndPaymentsByResidentId(id),
		enabled: !!id,
	});
};

export const useGetResidentResidences = (id: number) => {
	return useQuery({
		queryKey: ["resident-residences", id],
		queryFn: () => getResidentResidences(id),
		enabled: !!id,
	});
};
