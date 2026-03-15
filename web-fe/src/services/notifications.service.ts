import axiosInstance from "@/lib/axios";
import type {
	NotificationData,
	NotificationPayload,
} from "@/types/notification";

const BASE = "/notifications";

const buildFormData = (data: NotificationPayload) => {
	const formData = new FormData();

	// console.log("Data received in service:", data);
	// console.log("Files received:", data.files);

	formData.append("title", data.title);
	formData.append("content", data.content);
	formData.append("type", data.type);
	formData.append("isUrgent", String(data.isUrgent));
	formData.append("targetScope", data.targetScope);
	if (data.publishedAt) {
		formData.append("publishedAt", data.publishedAt.toISOString());
	}

	// channels
	if (data.channels?.length) {
		data.channels.forEach((ch) => formData.append("channels[]", ch));
	}

	// target blocks
	if (data.targetBlocks?.length) {
		data.targetBlocks.forEach((block, index) => {
			formData.append(`targetBlocks[${index}][blockId]`, String(block.blockId));
			if (block.targetFloorNumbers?.length) {
				block.targetFloorNumbers.forEach((floor, fIndex) => {
					formData.append(
						`targetBlocks[${index}][targetFloorNumbers][${fIndex}]`,
						String(floor),
					);
				});
			}
		});
	}

	// files
	if (data.files && data.files.length > 0) {
		data.files.forEach((file) => {
			// console.log("Appending file:", file.name, file.size);
			formData.append("files", file);
		});
	} else {
		console.warn("No files found in payload!");
	}

	return formData;
};

export const notificationService = {
	getAll: async (params?: any) => {
		const response = await axiosInstance.get<{ data: NotificationData[] }>(
			BASE,
			{
				params,
			},
		);
		return response.data.data;
	},

	getById: async (id: number) => {
		const response = await axiosInstance.get<{ data: NotificationData }>(
			`${BASE}/${id}`,
		);
		return response.data.data;
	},

	create: async (payload: NotificationPayload) => {
		const formData = buildFormData(payload);

		const response = await axiosInstance.post(BASE, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	update: async (id: number, payload: NotificationPayload) => {
		const formData = buildFormData(payload);

		const response = await axiosInstance.patch(`${BASE}/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	delete: async (id: number) => {
		return await axiosInstance.delete(`${BASE}/${id}`);
	},

	deleteMany: async (ids: number[]) => {
		return await axiosInstance.post(`${BASE}/delete-many`, { ids });
	},
};
