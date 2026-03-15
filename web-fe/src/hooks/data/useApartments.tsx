import {
	createApartment,
	deleteApartment,
	getApartmentById,
	getApartments,
	mutilDeleteApartment,
	updateApartment,
} from "@/services/apartments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useApartments = () => {
	return useQuery({
		queryKey: ["apartments"],
		queryFn: getApartments,
	});
};

export const useGetApartmentById = (id: number) => {
	return useQuery({
		queryKey: ["apartment", id],
		queryFn: () => getApartmentById(id),
		enabled: !!id,
	});
};

export const useCreateApartment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createApartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apartments"] });
		},
	});
};

export const useUpdateApartment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateApartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apartments"] });
			queryClient.invalidateQueries({ queryKey: ["apartment"] });
		},
	});
};

export const useDeleteApartment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteApartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apartments"] });
		},
	});
};
export const useMutilDeleteApartment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: mutilDeleteApartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apartments"] });
		},
	});
};
