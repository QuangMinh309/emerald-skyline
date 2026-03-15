import axiosInstance from "@/lib/axios";
import type { Fee, FeeDetail } from "@/types/fee";

// nao chi can sua service là xong
export const getFees = async () => {
	const response = await axiosInstance.get("/fees");
	return response.data.data as Fee[];
};

export const getFeeById = async (id: number) => {
	const response = await axiosInstance.get(`/fees/${id}`);
	return response.data.data as FeeDetail;
};
