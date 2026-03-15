import axiosInstance from "@/lib/axios";
import type {
	VotingData,
	VotingPayload,
	VotingStatistic,
} from "@/types/voting";

const BASE = "/votings";

const buildFormData = (data: VotingPayload) => {
	const formData = new FormData();

	formData.append("title", data.title);
	formData.append("content", data.content);
	formData.append("isRequired", String(data.isRequired));
	formData.append("startTime", data.startTime);
	formData.append("endTime", data.endTime);
	formData.append("targetScope", data.targetScope);

	if (data.options?.length) {
		data.options.forEach((opt, index) => {
			if (opt.id) formData.append(`options[${index}][id]`, String(opt.id));
			formData.append(`options[${index}][name]`, opt.name);
			if (typeof opt.description === "string") {
				formData.append(`options[${index}][description]`, opt.description);
			}
		});
	}

	if (data.targetScope !== "ALL" && data.targetBlocks?.length) {
		formData.append("targets", JSON.stringify(data.targetBlocks));
	}

	if (data.files && data.files.length > 0) {
		data.files.forEach((file) => {
			formData.append("files", file);
		});
	}

	return formData;
};

export const votingService = {
	getAll: async (params?: any) => {
		const response = await axiosInstance.get<{ data: VotingData[] }>(BASE, {
			params,
		});
		return response.data.data;
	},
	getById: async (id: number) => {
		const response = await axiosInstance.get<{ data: VotingData }>(
			`${BASE}/${id}`,
		);
		return response.data.data;
	},
	getStatistics: async (id: number) => {
		const response = await axiosInstance.get<{ data: VotingStatistic }>(
			`${BASE}/${id}/statistics`,
		);
		return response.data.data;
	},
	create: async (payload: VotingPayload) => {
		const formData = buildFormData(payload);
		const response = await axiosInstance.post(BASE, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	},
	update: async (payload: VotingPayload & { id: number }) => {
		const { id, ...data } = payload;
		const formData = buildFormData(data as VotingPayload);
		const response = await axiosInstance.patch(`${BASE}/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	},
	delete: async (id: number) => {
		return await axiosInstance.delete(`${BASE}/${id}`);
	},
	deleteMany: async (ids: number[]) => {
		return axiosInstance.delete(`${BASE}/batch/delete`, {
			data: { ids: ids },
		});
	},
};
