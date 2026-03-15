import {
	createTechnician,
	deleteTechnician,
	deleteManyTechnicians,
	getTechnicianById,
	getTechnicians,
	updateTechnician,
} from "@/services/technicians.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTechnicians = () => {
	return useQuery({
		queryKey: ["technicians"],
		queryFn: getTechnicians,
	});
};

export const useGetTechnicianById = (id: number) => {
	return useQuery({
		queryKey: ["technician", id],
		queryFn: () => getTechnicianById(id),
		enabled: !!id,
	});
};

export const useCreateTechnician = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createTechnician,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["technicians"] });
		},
	});
};

export const useUpdateTechnician = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateTechnician,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["technicians"] });
			queryClient.invalidateQueries({ queryKey: ["technician"] });
		},
	});
};

export const useDeleteTechnician = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteTechnician,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["technicians"] });
		},
	});
};

export const useDeleteManyTechnicians = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyTechnicians(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["technicians"] });
		},
	});
};
