import axiosInstance from "@/lib/axios";
import type { Apartment, ApartmentDetail } from "@/types/apartment";

export const getApartments = async () => {
	const response = await axiosInstance.get("/apartments");
	return response.data.data as Apartment[];
};

export const createApartment = async (apartmentData: {
	roomName: string;
	type: string;
	blockId: number;
	floor: number;
	area: number;
	owner_id: number;
	residents: {
		id: number;
		relationship: string;
	}[];
}) => {
	const response = await axiosInstance.post("/apartments", apartmentData);
	console.log("Created apartment response:", apartmentData);
	return response.data.data as Apartment;
};
export const updateApartment = async ({
	id,
	data,
}: {
	id: number;
	data: {
		roomName: string;
		type: string;
		blockId: number;
		floor: number;
		area: number;
		owner_id: number;
		residents: {
			id: number;
			relationship: string;
		}[];
	};
}) => {
	console.log("Update apartment called with id:", id, "and data:", data);
	const response = await axiosInstance.patch(`/apartments/${id}`, data);
	return response.data.data as Apartment;
};
export const deleteApartment = async (apartmentId: number) => {
	const response = await axiosInstance.delete(`/apartments/${apartmentId}`);
	return response.data;
};
export const getApartmentById = async (id: number) => {
	const response = await axiosInstance.get(`/apartments/${id}`);
	return response.data.data as ApartmentDetail;
};
export const mutilDeleteApartment = async (ids: number) => {
	const response = await axiosInstance.post(`/apartments/delete-many`, { ids });
	return response.data;
};
