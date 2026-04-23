import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IssueStatus, IssueType } from "@/types/issue";

const { mockedAxiosInstance } = vi.hoisted(() => ({
	mockedAxiosInstance: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("@/lib/axios", () => ({
	default: mockedAxiosInstance,
}));

import { issueService } from "@/services/issues.service";

describe("issues service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches issue list with query params", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1, title: "Leak in hallway" }] },
		});

		const params: {
			status: IssueStatus;
			type: IssueType;
			blockId: number;
			isUrgent: boolean;
			search: string;
		} = {
			status: "PENDING",
			type: "TECHNICAL",
			blockId: 2,
			isUrgent: true,
			search: "leak",
		};
		const result = await issueService.getAll(params);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/issues", {
			params,
		});
		expect(result).toEqual([{ id: 1, title: "Leak in hallway" }]);
	});

	it("gets issue detail by id", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 5, title: "Water overflow" } },
		});

		const result = await issueService.getById(5);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/issues/5");
		expect(result).toEqual({ id: 5, title: "Water overflow" });
	});

	it("updates issue payload", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 8, status: "PROCESSING" } },
		});

		const result = await issueService.update(8, {
			status: "PROCESSING",
			isUrgent: false,
			estimatedCompletionDate: "2026-04-30",
		});

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith("/issues/8", {
			status: "PROCESSING",
			isUrgent: false,
			estimatedCompletionDate: "2026-04-30",
		});
		expect(result).toEqual({ id: 8, status: "PROCESSING" });
	});

	it("rejects issue with reason", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 9, status: "REJECTED" } },
		});

		const result = await issueService.reject(
			9,
			"Not a valid maintenance issue",
		);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/issues/9/reject", {
			rejectionReason: "Not a valid maintenance issue",
		});
		expect(result).toEqual({ id: 9, status: "REJECTED" });
	});

	it("assigns technician department to issue", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 11, assignedToTechnicianDepartment: true } },
		});

		const result = await issueService.assignTechnicianDepartment(11);

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/issues/11/assign-technician-department",
		);
		expect(result).toEqual({
			id: 11,
			assignedToTechnicianDepartment: true,
		});
	});

	it("propagates issue fetch errors", async () => {
		mockedAxiosInstance.get.mockRejectedValueOnce(new Error("Server error"));

		await expect(issueService.getAll()).rejects.toThrow("Server error");
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/issues", {
			params: undefined,
		});
	});
});
