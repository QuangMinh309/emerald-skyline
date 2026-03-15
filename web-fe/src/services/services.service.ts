import axiosInstance from "@/lib/axios";
import type { Service } from "@/types/service";

export const getServices = async (): Promise<Service[]> => {
	const res = await axiosInstance.get("/services");
	return res.data.data as Service[];
};

export const getServiceById = async (id: number): Promise<Service> => {
	const res = await axiosInstance.get(`/services/${id}`);
	return res.data.data as Service;
};

export type CreateServiceInput = Omit<Service, "id" | "createdAt">;

// POST /services
export const createService = async (payload: FormData): Promise<Service> => {
	const res = await axiosInstance.post("/services", payload, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return res.data.data as Service;
};

export const updateService = async (args: {
	id: number;
	payload: FormData;
}) => {
	const res = await axiosInstance.patch(`/services/${args.id}`, args.payload, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return res.data.data as Service;
};

export const deleteService = async (id: number) => {
	const res = await axiosInstance.delete(`/services/${id}`);
	return res.data;
};
export const deleteManyServices = async (ids: number[]) => {
	const res = await axiosInstance.post(`/services/delete-many`, { ids });
	return res.data;
};
