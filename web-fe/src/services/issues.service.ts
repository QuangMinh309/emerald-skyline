import axiosInstance from "@/lib/axios";
import type {
	IssueListItem,
	IssueDetail,
	UpdateIssuePayload,
	IssueStatus,
	IssueType,
} from "@/types/issue";

const BASE = "/issues";

export const issueService = {
	getAll: async (params?: {
		status?: IssueStatus;
		type?: IssueType;
		blockId?: number;
		isUrgent?: boolean;
		search?: string;
	}) => {
		const res = await axiosInstance.get<{ data: IssueListItem[] }>(BASE, {
			params,
		});
		return res.data.data;
	},

	getById: async (id: number) => {
		const res = await axiosInstance.get<{ data: IssueDetail }>(`${BASE}/${id}`);
		return res.data.data;
	},

	update: async (id: number, data: UpdateIssuePayload) => {
		const res = await axiosInstance.patch(`${BASE}/${id}`, data);
		return res.data.data;
	},

	reject: async (id: number, rejectionReason: string) => {
		const res = await axiosInstance.post(`${BASE}/${id}/reject`, {
			rejectionReason,
		});
		return res.data.data;
	},

	assignTechnicianDepartment: async (id: number) => {
		const res = await axiosInstance.patch(
			`${BASE}/${id}/assign-technician-department`,
		);
		return res.data.data;
	},
};
