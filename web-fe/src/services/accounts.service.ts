import axiosInstance from "@/lib/axios";
import type {
	Account,
	CreateAccountPayload,
	UpdateAccountPayload,
} from "@/types/account";

export const getAccounts = async (params?: {
	search?: string;
	role?: string;
	isActive?: boolean;
}) => {
	const response = await axiosInstance.get("/accounts", { params });
	return response.data.data as Account[];
};

export const getAccountById = async (id: number) => {
	const response = await axiosInstance.get(`/accounts/${id}`);
	return response.data.data as Account;
};

export const createAccount = async (accountData: CreateAccountPayload) => {
	const response = await axiosInstance.post("/accounts", accountData);
	return response.data.data as Account;
};

export const updateAccount = async ({
	id,
	data,
}: {
	id: number;
	data: UpdateAccountPayload;
}) => {
	const response = await axiosInstance.patch(`/accounts/${id}`, data);
	return response.data.data as Account;
};

export const deleteAccount = async (accountId: number) => {
	const response = await axiosInstance.delete(`/accounts/${accountId}`);
	return response.data;
};

export const deleteManyAccounts = async (ids: number[]) => {
	const response = await axiosInstance.post(`/accounts/delete-many`, { ids });
	return response.data;
};

export const restoreAccount = async (accountId: number) => {
	const response = await axiosInstance.patch(`/accounts/${accountId}/restore`);
	return response.data.data as Account;
};
