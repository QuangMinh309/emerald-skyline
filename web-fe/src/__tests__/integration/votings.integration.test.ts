import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { votingService } from "@/services/votings.service";

describe("voting service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches voting list and detail", async () => {
		mockedAxiosInstance.get
			.mockResolvedValueOnce({
				data: { data: [{ id: 1, title: "Tree planting" }] },
			})
			.mockResolvedValueOnce({
				data: { data: { id: 2, title: "Parking expansion" } },
			});

		const list = await votingService.getAll({ status: "ONGOING" });
		const detail = await votingService.getById(2);

		expect(mockedAxiosInstance.get).toHaveBeenNthCalledWith(1, "/votings", {
			params: { status: "ONGOING" },
		});
		expect(mockedAxiosInstance.get).toHaveBeenNthCalledWith(2, "/votings/2");
		expect(list).toEqual([{ id: 1, title: "Tree planting" }]);
		expect(detail).toEqual({ id: 2, title: "Parking expansion" });
	});

	it("creates, updates, and deletes votings", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 3, title: "Community survey" } },
		});
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 3, title: "Updated survey" } },
		});
		mockedAxiosInstance.delete.mockResolvedValueOnce({
			data: { success: true },
		});

		const file = new File(["x"], "attachment.txt", { type: "text/plain" });
		const created = await votingService.create({
			title: "Community survey",
			content: "Choose the new facility",
			isRequired: true,
			startTime: "2026-04-23T08:00:00.000Z",
			endTime: "2026-04-30T08:00:00.000Z",
			targetScope: "BLOCK",
			options: [{ name: "Option A", description: "First choice" }],
			targetBlocks: [{ blockId: 1, targetFloorNumbers: ["1", "2"] }],
			files: [file],
		});
		const updated = await votingService.update({
			id: 3,
			title: "Updated survey",
			content: "Choose again",
			isRequired: false,
			startTime: "2026-05-01T08:00:00.000Z",
			endTime: "2026-05-07T08:00:00.000Z",
			targetScope: "ALL",
			options: [{ id: 11, name: "Option B" }],
			targetBlocks: [],
		});
		const deleted = await votingService.delete(3);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/votings",
			expect.any(FormData),
			expect.objectContaining({
				headers: { "Content-Type": "multipart/form-data" },
			}),
		);
		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/votings/3",
			expect.any(FormData),
			expect.objectContaining({
				headers: { "Content-Type": "multipart/form-data" },
			}),
		);
		expect(mockedAxiosInstance.delete).toHaveBeenCalledWith("/votings/3");
		expect(created).toEqual({ data: { id: 3, title: "Community survey" } });
		expect(updated).toEqual({ data: { id: 3, title: "Updated survey" } });
		expect(deleted).toEqual({ data: { success: true } });
	});

	it("fetches voting statistics and deletes many votes", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { votingId: 4, participationRate: 0.5 } },
		});
		mockedAxiosInstance.delete.mockResolvedValueOnce({
			data: { success: true },
		});

		const stats = await votingService.getStatistics(4);
		const deletedMany = await votingService.deleteMany([10, 11]);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/votings/4/statistics",
		);
		expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(
			"/votings/batch/delete",
			{ data: { ids: [10, 11] } },
		);
		expect(stats).toEqual({ votingId: 4, participationRate: 0.5 });
		expect(deletedMany).toEqual({ data: { success: true } });
	});

	it("supports creating a voting without files or targets", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 5, title: "Quick poll" } },
		});

		const created = await votingService.create({
			title: "Quick poll",
			content: "Agree or disagree",
			isRequired: false,
			startTime: "2026-04-23T08:00:00.000Z",
			endTime: "2026-04-24T08:00:00.000Z",
			targetScope: "ALL",
			options: [],
			targetBlocks: [],
		});

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/votings",
			expect.any(FormData),
			expect.objectContaining({
				headers: { "Content-Type": "multipart/form-data" },
			}),
		);
		expect(created).toEqual({ data: { id: 5, title: "Quick poll" } });
	});
});
