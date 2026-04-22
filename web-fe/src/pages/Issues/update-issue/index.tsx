"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { ArrowRight, Ticket, CheckCircle2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";

import { Modal } from "@/components/common/Modal";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/DatePicker";
import Spinner from "@/components/common/Spinner";
import { Label } from "@/components/ui/label";

import { IssueInfoSection } from "./info";
import { AssignTechnicianConfirm } from "./assign";
import CreateIncidentMaintenanceModal from "@/pages/Maintenances/incident/create-incident-maintenance";

import {
	useIssue,
	useUpdateIssue,
	useAssignTechnicianDepartment,
} from "@/hooks/data/useIssues";
import { IssueStatusOptions } from "@/constants/issueStatus";

interface UpdateModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	issueId: number;
	onSuccess?: () => void;
}

const UpdateSchema = z.object({
	status: z.string().min(1, "Vui lòng chọn trạng thái"),
	isUrgent: z.string(),
	estimatedCompletionDate: z.date({
		message: "Vui lòng chọn ngày dự kiến hoàn thành",
	}),
});

type FormValues = z.infer<typeof UpdateSchema>;

const getStatusTextColor = (status: string) => {
	switch (status) {
		case "PENDING":
			return "text-[#D97706]";
		case "RECEIVED":
			return "text-purple-700";
		case "PROCESSING":
			return "text-[#1E40AF]";
		case "RESOLVED":
			return "text-[#166534]";
		case "REJECTED":
			return "text-[#DC2626]";
		default:
			return "text-gray-700";
	}
};

const UpdateIssueModal = ({
	open,
	setOpen,
	issueId,
	onSuccess,
}: UpdateModalProps) => {
	const navigate = useNavigate();

	const {
		data: issue,
		isLoading: isLoadingDetail,
		refetch,
	} = useIssue(issueId);
	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue();
	const { mutate: assignTech, isPending: isAssigning } =
		useAssignTechnicianDepartment();

	const [isAssignConfirmOpen, setIsAssignConfirmOpen] = useState(false);
	const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
	const [pendingTicketData, setPendingTicketData] = useState<{
		title: string;
		description?: string;
		priority?: string;
		assetId: number;
	} | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(UpdateSchema),
		defaultValues: {
			status: "",
			isUrgent: "false",
			estimatedCompletionDate: new Date(), // mặc định hôm nay
		},
	});

	useEffect(() => {
		if (open && issue) {
			const urgentValue = issue.isUrgent ? "true" : "false";
			const statusValue = issue.status || "";
			const dateValue = issue.estimatedCompletionDate
				? new Date(issue.estimatedCompletionDate)
				: new Date();

			const newValues = {
				status: statusValue,
				isUrgent: urgentValue,
				estimatedCompletionDate: dateValue,
			};

			setTimeout(() => form.reset(newValues), 0);
		}
	}, [issue, open, form]);

	const availableStatuses = useMemo(() => {
		if (!issue) return [];
		const current = issue.status;
		let allowed: string[] = [current];
		if (current === "RECEIVED") allowed.push("PROCESSING");
		else if (current === "PROCESSING") allowed.push("RESOLVED");
		return IssueStatusOptions.filter((opt) => allowed.includes(opt.value));
	}, [issue]);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const handleCreateTicketClick = async () => {
		if (!issue || issue.maintenanceTicket) return;

		const isValidDate = await form.trigger("estimatedCompletionDate");
		if (!isValidDate) return;

		// const dateValue = form.getValues("estimatedCompletionDate");

		// const payload = {
		//   status: "PROCESSING" as any,
		//   estimatedCompletionDate: dateValue.toISOString(),
		// };

		// updateIssue(
		//   { id: issueId, data: payload },
		//   {
		//     onSuccess: () => {
		//       toast.success("Đã xác nhận ngày dự kiến. Đang mở phiếu...");
		//       form.setValue("status", "PROCESSING");
		setIsCreateTicketOpen(true);
		//     },
		//     onError: (err: any) => {
		//       const msg = err?.response?.data?.message;
		//       toast.error(msg || "Lỗi cập nhật ngày");
		//     },
		//   },
		// );
	};

	const onSubmit = (values: FormValues) => {
		if (!issue) return;

		const payload: any = {
			isUrgent: values.isUrgent === "true",
			estimatedCompletionDate: values.estimatedCompletionDate.toISOString(),
		};

		if (values.status !== issue.status) {
			payload.status = values.status;
		}

		// Nếu có pending ticket data, tạo ticket trước rồi mới update issue
		if (pendingTicketData) {
			createTicketAndLinkToIssue(payload);
		} else {
			updateIssueOnly(payload);
		}
	};

	const updateIssueOnly = (payload: any) => {
		updateIssue(
			{ id: issueId, data: payload },
			{
				onSuccess: () => {
					toast.success("Cập nhật thành công");
					setOpen(false);
					onSuccess?.();
					refetch();
				},
				onError: (err: any) => {
					const msg = err?.response?.data?.message;
					toast.error(msg || "Lỗi cập nhật");
				},
			},
		);
	};

	const createTicketAndLinkToIssue = async (issuePayload: any) => {
		if (!pendingTicketData) return;

		try {
			// Bước 1: Tạo maintenance ticket
			const ticketResponse = await axiosInstance.post(
				"/maintenance-tickets/incident",
				{
					...pendingTicketData,
					type: "INCIDENT",
				},
			);

			const newTicketId = ticketResponse?.data?.data?.id;

			if (!newTicketId) {
				throw new Error("Không nhận được ID phiếu bảo trì");
			}

			// Bước 2: Update issue với ticket ID và thông tin khác
			updateIssue(
				{
					id: issueId,
					data: { ...issuePayload, maintenanceTicketId: newTicketId },
				},
				{
					onSuccess: () => {
						toast.success("Tạo phiếu và cập nhật thành công!");
						setPendingTicketData(null);
						setOpen(false);
						onSuccess?.();
						refetch();
					},
					onError: (err: any) => {
						const msg = err?.response?.data?.message;
						toast.error(msg || "Lỗi liên kết phiếu bảo trì");
					},
				},
			);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Lỗi tạo phiếu bảo trì");
		}
	};

	const handleTicketDataSaved = (data: {
		title: string;
		description?: string;
		priority?: string;
		assetId: number;
	}) => {
		setPendingTicketData(data);
		setIsCreateTicketOpen(false);
		toast.success("Đã lưu thông tin phiếu. Nhấn 'Lưu thay đổi' để hoàn tất.");
	};

	const handleAssignConfirm = () => {
		assignTech(issueId, {
			onSuccess: () => {
				toast.success("Đã chuyển bộ phận kỹ thuật!");
				setIsAssignConfirmOpen(false);
				refetch();
			},
			onError: (err: any) => toast.error(err?.message || "Lỗi chuyển bộ phận"),
		});
	};

	return (
		<>
			<Modal
				open={open}
				setOpen={setOpen}
				title="Cập nhật phản ánh"
				submitText="Lưu thay đổi"
				onLoading={isUpdating}
				onSubmit={form.handleSubmit(onSubmit)}
				className="max-w-[650px]"
			>
				{isLoadingDetail || !issue ? (
					<div className="flex justify-center items-center h-[500px] ">
						<Spinner />
					</div>
				) : (
					<Form {...form}>
						<form className="space-y-6 px-1" key={issue.id}>
							<IssueInfoSection issue={issue} />

							<div className="space-y-5">
								<div className="grid grid-cols-2 gap-5">
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel isRequired>Trạng thái</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value || ""}
													// disable nếu đã có ticket liên kết
													disabled={!!issue.maintenanceTicket}
												>
													<FormControl>
														<SelectTrigger className="h-10 bg-white disabled:opacity-90 disabled:bg-gray-100 disabled:cursor-not-allowed">
															<SelectValue placeholder="Chọn trạng thái">
																<span
																	className={getStatusTextColor(field.value)}
																>
																	{
																		IssueStatusOptions.find(
																			(o) => o.value === field.value,
																		)?.label
																	}
																</span>
															</SelectValue>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{availableStatuses.map((opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																<span className={getStatusTextColor(opt.value)}>
																	{opt.label}
																</span>
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												{issue.maintenanceTicket && (
													<p className="text-[11px] text-main mt-1 font-medium italic">
														* Trạng thái được quản lý bởi phiếu bảo trì đã liên
														kết.
													</p>
												)}

												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isUrgent"
										render={({ field }) => (
											<FormItem>
												<FormLabel isRequired>Mức độ</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value || ""}
												>
													<FormControl>
														<SelectTrigger className="h-10 bg-white">
															<SelectValue placeholder="Chọn mức độ" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="false">Bình thường</SelectItem>
														<SelectItem value="true">
															<span className="text-orange-600">Khẩn cấp</span>
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-5">
									<FormField
										control={form.control}
										name="estimatedCompletionDate"
										render={({ field }) => (
											<FormItem className="flex flex-col justify-end">
												<FormLabel isRequired>
													Ngày dự kiến hoàn thành
												</FormLabel>
												<FormControl>
													<DatePicker
														value={field.value}
														onChange={field.onChange}
														placeholder="Chọn ngày"
														minDate={today}
														className="h-10 bg-white"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex flex-col justify-end">
										<Label className="mb-2 invisible">Action</Label>
										{issue.assignedToTechnicianDepartment ? (
											<Button
												type="button"
												disabled
												className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold h-10 opacity-100 cursor-not-allowed"
											>
												<CheckCircle2 className="w-4 h-4 mr-2" />
												Đã chuyển cho bộ phận kỹ thuật
											</Button>
										) : (
											<Button
												type="button"
												className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800 font-semibold h-10 border-none shadow-sm transition-colors"
												onClick={() => setIsAssignConfirmOpen(true)}
											>
												<CheckCircle2 className="w-4 h-4 mr-2" />
												Chuyển cho bộ phận kỹ thuật
											</Button>
										)}
									</div>
								</div>
							</div>

							<div className="w-full h-[1px] bg-gray-300 mt-2" />

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold">Xử lý sự cố</span>
								</div>

								{issue.maintenanceTicket ? (
									<div className="border border-main/20 bg-third rounded-lg p-4 flex items-center justify-between transition hover:shadow-sm">
										<div className="flex items-center gap-3">
											<div className="p-2.5 rounded-full bg-main/10 text-main">
												<Ticket size={22} />
											</div>
											<div>
												<p className="text-sm text-main font-bold">
													Phiếu bảo trì
												</p>
												<p className="text-sm text-black">
													{issue.maintenanceTicket.title}
												</p>
											</div>
										</div>

										<Button
											variant="ghost"
											size="sm"
											className="text-main hover:text-main hover:bg-main/10 font-medium"
											onClick={() =>
												navigate(`/maintenances/${issue.maintenanceTicket?.id}`)
											}
											type="button"
										>
											<p className="text-[13px]">Chi tiết</p>
											<ArrowRight size={17} className="ml-0.5" />
										</Button>
									</div>
								) : (
									<>
										{pendingTicketData ? (
											<div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm font-semibold text-orange-800">
															Phiếu chưa lưu
														</p>
														<p className="text-sm text-orange-600">
															{pendingTicketData.title}
														</p>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															setPendingTicketData(null);
															setIsCreateTicketOpen(true);
														}}
														className="text-orange-700 hover:text-orange-800 hover:bg-orange-100"
													>
														Chỉnh sửa
													</Button>
												</div>
											</div>
										) : (
											<Button
												type="button"
												onClick={handleCreateTicketClick}
												className="w-full bg-[#DFA975] hover:bg-[#d4965c] text-black font-semibold h-10 border-none"
											>
												<Plus className="w-4 h-4 mr-2" />
												Tạo phiếu xử lý sự cố
											</Button>
										)}
									</>
								)}
							</div>
						</form>
					</Form>
				)}
			</Modal>

			<AssignTechnicianConfirm
				open={isAssignConfirmOpen}
				setOpen={setIsAssignConfirmOpen}
				onConfirm={handleAssignConfirm}
				isLoading={isAssigning}
				issueTitle={issue?.title}
			/>

			<CreateIncidentMaintenanceModal
				open={isCreateTicketOpen}
				setOpen={setIsCreateTicketOpen}
				onDataSubmit={handleTicketDataSaved}
				initialData={{
					title: `Xử lý yêu cầu: ${issue?.title}`,
					description: issue?.description,
				}}
			/>
		</>
	);
};

export default UpdateIssueModal;
