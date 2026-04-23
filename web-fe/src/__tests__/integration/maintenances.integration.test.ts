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

import {
	assignTechnician,
	cancelMaintenanceTicket,
	completeIncidentTicket,
	completeScheduledTicket,
	createIncidentTicket,
	createScheduledTicket,
	deleteMaintenanceTicket,
	deleteManyMaintenanceTickets,
	getMaintenanceTicketDetail,
	getMaintenanceTickets,
	startMaintenanceWork,
	updateIncidentTicket,
	updateMaintenanceProgress,
} from "@/services/maintenances.service";

describe("maintenances service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches maintenance tickets with query params", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1, title: "Fix elevator" }] },
		});

		const params = { status: "PENDING" as const, assetId: 9 };
		const result = await getMaintenanceTickets(params);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/maintenance-tickets",
			{ params },
		);
		expect(result).toEqual([{ id: 1, title: "Fix elevator" }]);
	});

	it("gets ticket detail and creates incident ticket", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 2, title: "Water leak" } },
		});
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 3, title: "Broken lock" } },
		});

		const detail = await getMaintenanceTicketDetail(2);
		const created = await createIncidentTicket({
			title: "Broken lock",
			description: "Lock is stuck",
			type: "INCIDENT",
			priority: "HIGH",
			assetId: 7,
		});

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/maintenance-tickets/2",
		);
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/maintenance-tickets/incident",
			{
				title: "Broken lock",
				description: "Lock is stuck",
				type: "INCIDENT",
				priority: "HIGH",
				assetId: 7,
			},
		);
		expect(detail).toEqual({ id: 2, title: "Water leak" });
		expect(created).toEqual({ id: 3, title: "Broken lock" });
	});

	it("creates, assigns, and starts scheduled maintenance", async () => {
		mockedAxiosInstance.post
			.mockResolvedValueOnce({
				data: { data: { id: 4, title: "Quarterly check" } },
			})
			.mockResolvedValueOnce({ data: { data: { id: 4, technicianId: 12 } } })
			.mockResolvedValueOnce({
				data: { data: { id: 4, status: "PROCESSING" } },
			});

		const created = await createScheduledTicket({
			title: "Quarterly check",
			type: "MAINTENANCE",
			assetId: 9,
			checklistItems: [{ task: "Inspect", isChecked: false }],
		});
		const assigned = await assignTechnician({
			id: 4,
			data: { technicianId: 12, estimatedCost: 500000 },
		});
		const started = await startMaintenanceWork(4);

		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			1,
			"/maintenance-tickets/scheduled",
			expect.objectContaining({
				title: "Quarterly check",
				type: "MAINTENANCE",
				assetId: 9,
			}),
		);
		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			2,
			"/maintenance-tickets/4/assign",
			{ technicianId: 12, estimatedCost: 500000 },
		);
		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			3,
			"/maintenance-tickets/4/start",
		);
		expect(created).toEqual({ id: 4, title: "Quarterly check" });
		expect(assigned).toEqual({ id: 4, technicianId: 12 });
		expect(started).toEqual({ id: 4, status: "PROCESSING" });
	});

	it("updates, completes, cancels, and deletes tickets", async () => {
		mockedAxiosInstance.post
			.mockResolvedValueOnce({
				data: { data: { id: 5, status: "PROCESSING" } },
			})
			.mockResolvedValueOnce({ data: { data: { id: 5, result: "GOOD" } } })
			.mockResolvedValueOnce({
				data: { data: { id: 5, status: "CANCELLED" } },
			});
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 5, title: "Updated title" } },
		});
		mockedAxiosInstance.delete
			.mockResolvedValueOnce({ data: { data: { message: "Deleted" } } })
			.mockResolvedValueOnce({
				data: { data: { message: "Deleted", deletedIds: [6, 7] } },
			});

		const progress = await updateMaintenanceProgress(5, [
			{ task: "Check pipes", isChecked: true },
		]);
		const completed = await completeScheduledTicket(5, {
			result: "GOOD",
			actualCost: 250000,
		});
		const cancelled = await cancelMaintenanceTicket(5, "No access");
		const updated = await updateIncidentTicket(5, { title: "Updated title" });
		const deleted = await deleteMaintenanceTicket(5);
		const deletedMany = await deleteManyMaintenanceTickets([6, 7]);

		expect(progress).toEqual({ id: 5, status: "PROCESSING" });
		expect(completed).toEqual({ id: 5, result: "GOOD" });
		expect(cancelled).toEqual({ id: 5, status: "CANCELLED" });
		expect(updated).toEqual({ id: 5, title: "Updated title" });
		expect(deleted).toEqual({ message: "Deleted" });
		expect(deletedMany).toEqual({ message: "Deleted", deletedIds: [6, 7] });
	});

	it("submits incident completion as multipart form data", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 8, result: "GOOD" } },
		});

		const image = new File(["img"], "image.png", { type: "image/png" });
		const promise = completeIncidentTicket(8, {
			result: "GOOD",
			actualCost: 100000,
			resultNote: "Finished",
			images: [image],
		});

		const [url, body, config] = mockedAxiosInstance.post.mock.calls[0];
		expect(url).toBe("/maintenance-tickets/incident/8/complete");
		expect(body).toBeInstanceOf(FormData);
		expect((body as FormData).get("result")).toBe("GOOD");
		expect((body as FormData).get("actualCost")).toBe("100000");
		expect(config).toEqual({
			headers: { "Content-Type": "multipart/form-data" },
		});
		await expect(promise).resolves.toEqual({ id: 8, result: "GOOD" });
	});

	it("propagates maintenance detail errors", async () => {
		mockedAxiosInstance.get.mockRejectedValueOnce(new Error("Forbidden"));

		await expect(getMaintenanceTicketDetail(99)).rejects.toThrow("Forbidden");
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/maintenance-tickets/99",
		);
	});

	it("sends a multipart body even when optional completion note is omitted", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 10, result: "GOOD" } },
		});

		const promise = completeIncidentTicket(10, {
			result: "GOOD",
			actualCost: 300000,
		});

		const [url, body] = mockedAxiosInstance.post.mock.calls[0];
		expect(url).toBe("/maintenance-tickets/incident/10/complete");
		expect(body).toBeInstanceOf(FormData);
		expect((body as FormData).get("resultNote")).toBeNull();
		await expect(promise).resolves.toEqual({ id: 10, result: "GOOD" });
	});
});
