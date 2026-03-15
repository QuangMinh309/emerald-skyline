import axiosInstance from "@/lib/axios";
import type { Technician, TechnicianDetail } from "@/types/technician";

export const getTechnicians = async () => {
	const response = await axiosInstance.get("/technicians");
	return response.data.data as Technician[];
};
export const createTechnician = async (technicianData: {
	fullName: string;
	phoneNumber: string;
	status: string;
	description?: string | null;
}) => {
	const response = await axiosInstance.post("/technicians", technicianData);
	console.log("Created technician response:", technicianData);
	return response.data.data as Technician;
};
export const updateTechnician = async ({
	id,
	data,
}: {
	id: number;
	data: {
		fullName: string;
		phoneNumber: string;
		status: string;
		description?: string | null;
	};
}) => {
	console.log("Update technician called with id:", id, "and data:", data);
	const response = await axiosInstance.patch(`/technicians/${id}`, data);
	return response.data.data as Technician;
};
export const deleteTechnician = async (technicianId: number) => {
	const response = await axiosInstance.delete(`/technicians/${technicianId}`);
	return response.data;
};

export const deleteManyTechnicians = async (ids: number[]) => {
	const response = await axiosInstance.post(`/technicians/delete-many`, {
		ids,
	});
	return response.data;
};

export const getTechnicianById = async (id: number) => {
	const response = await axiosInstance.get(`/technicians/${id}`);
	return response.data.data as TechnicianDetail;
};
