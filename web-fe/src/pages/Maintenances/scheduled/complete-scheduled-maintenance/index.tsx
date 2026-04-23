"use client";

import { Modal } from "@/components/common/Modal";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { MaintenanceResultOptions } from "@/constants/maintenanceResult";
import { useCompleteScheduledTicket } from "@/hooks/data/useMaintenance";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	ticketId?: number;
}

/* =====================
   Schema
===================== */
const CompleteScheduledMaintenanceSchema = z.object({
	result: z.string().min(1, "Vui lòng chọn kết quả"),
	resultNote: z.string().optional(),
	hasIssue: z.boolean(),
	issueDetail: z.string().optional(),
	actualCost: z.number().min(1, "Chi phí thực tế phải > 0"),
});

type CompleteFormValues = z.infer<typeof CompleteScheduledMaintenanceSchema>;

const CompleteScheduledMaintenanceModal = ({
	open,
	setOpen,
	ticketId,
}: ModalProps) => {
	const { mutate: completeTicket, isPending } = useCompleteScheduledTicket();

	const form = useForm<CompleteFormValues>({
		resolver: zodResolver(CompleteScheduledMaintenanceSchema),
		defaultValues: {
			result: "",
			resultNote: "",
			hasIssue: false,
			issueDetail: "",
			actualCost: 0,
		},
	});

	const hasIssue = form.watch("hasIssue");

	/* =====================
     Submit
  ===================== */
	const onSubmit = (values: CompleteFormValues) => {
		if (!ticketId) return;

		completeTicket(
			{
				id: ticketId,
				data: {
					result: values.result as any,
					resultNote: values.resultNote,
					hasIssue: values.hasIssue,
					issueDetail: values.hasIssue ? values.issueDetail : undefined,
					actualCost: values.actualCost || 0,
				},
			},
			{
				onSuccess: () => {
					toast.success("Đã hoàn thành yêu cầu bảo trì");
					handleClose();
				},
				onError: (err) => {
					toast.error(`Lỗi: ${err.message}`);
				},
			},
		);
	};

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	/* =====================
     Render
  ===================== */
	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Hoàn thành bảo trì"
			submitText="Hoàn thành"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					{/* Kết quả */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="result"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Kết quả bảo trì</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Chọn kết quả" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{MaintenanceResultOptions.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					{/* Ghi chú */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="resultNote"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Ghi chú kết quả</FormLabel>
								<FormControl>
									<Textarea
										rows={3}
										placeholder="Nhập ghi chú (nếu có)"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					{/* Có vấn đề */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="hasIssue"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center gap-2">
									<Checkbox
										checked={field.value}
										onCheckedChange={(v) => field.onChange(Boolean(v))}
									/>
									<Label className="cursor-pointer">Có vấn đề phát sinh</Label>
								</div>
							</FormItem>
						)}
					/>

					{/* Chi tiết vấn đề */}
					{hasIssue && (
						<FormField
							disabled={isPending}
							control={form.control}
							name="issueDetail"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Chi tiết vấn đề</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder="Mô tả chi tiết vấn đề"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					)}

					{/* Chi phí thực tế */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="actualCost"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Chi phí thực tế (VNĐ)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="1"
										placeholder="0"
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</Modal>
	);
};

export default CompleteScheduledMaintenanceModal;
