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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MaintenanceChecklistItem } from "@/types/maintenance";
import {
	useMaintenanceTicketDetail,
	useUpdateScheduledTicket,
} from "@/hooks/data/useMaintenance";
import { useAssets } from "@/hooks/data/useAssests";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

interface UpdateModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	ticketId?: number;
}

/* =======================
   Schema
======================= */

const UpdateScheduledMaintenanceSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập tiêu đề"),
	description: z.string().optional(),
	assetId: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof UpdateScheduledMaintenanceSchema>;

/* =======================
   Component
======================= */

const UpdateScheduledMaintenanceModal = ({
	open,
	setOpen,
	ticketId,
}: UpdateModalProps) => {
	const { data: ticket } = useMaintenanceTicketDetail(ticketId!);
	const { mutate: updateTicket, isPending } = useUpdateScheduledTicket();
	const { data: assets } = useAssets();

	const assetOptions = assets?.map((asset) => ({
		value: asset.id.toString(),
		label: `${asset.name} - Toà ${asset.blockName} - Tầng ${asset.floor}`,
	}));

	const [checklistItems, setChecklistItems] = useState<
		MaintenanceChecklistItem[]
	>([]);
	const [newTask, setNewTask] = useState("");

	const form = useForm<MaintenanceFormValues>({
		resolver: zodResolver(UpdateScheduledMaintenanceSchema),
		defaultValues: {
			title: "",
			description: "",
			assetId: "",
		},
	});

	/* =======================
     Init form
  ======================= */

	useEffect(() => {
		if (ticket && open) {
			form.reset({
				title: ticket.title,
				description: ticket.description || "",
				assetId: ticket.assetId?.toString() || "",
			});
			setChecklistItems(ticket.checklistItems || []);
		}
	}, [ticket, open, form]);

	/* =======================
     Checklist
  ======================= */

	const addChecklistItem = () => {
		if (!newTask.trim()) {
			toast.error("Vui lòng nhập công việc");
			return;
		}
		setChecklistItems([...checklistItems, { task: newTask, isChecked: false }]);
		setNewTask("");
	};

	const removeChecklistItem = (index: number) => {
		setChecklistItems(checklistItems.filter((_, i) => i !== index));
	};

	const handleClose = () => {
		setOpen(false);
		form.reset();
		setChecklistItems([]);
		setNewTask("");
	};

	/* =======================
     Submit
  ======================= */

	function onSubmit(values: MaintenanceFormValues) {
		if (!ticketId) return;

		updateTicket(
			{
				id: ticketId,
				data: {
					title: values.title,
					description: values.description,
					assetId: values.assetId ? Number(values.assetId) : undefined,
					checklistItems:
						checklistItems.length > 0 ? checklistItems : undefined,
				},
			},
			{
				onSuccess: () => {
					toast.success("Cập nhật lịch bảo trì thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi cập nhật lịch bảo trì",
					);
				},
			},
		);
	}

	/* =======================
     Render
  ======================= */

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Chỉnh sửa lịch bảo trì định kỳ"
			submitText="Lưu thay đổi"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						{/* Tiêu đề */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="col-span-2 space-y-1.5">
									<FormLabel isRequired>Tiêu đề</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tiêu đề" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Mô tả */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="col-span-2 space-y-1.5">
									<FormLabel>Mô tả công việc</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>

					{/* Asset */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="assetId"
						render={({ field }) => {
							const selectedAsset = assetOptions?.find(
								(a) => a.value === field.value,
							);

							return (
								<FormItem className="space-y-1.5 col-span-2">
									<FormLabel>Tài sản liên quan</FormLabel>

									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className="w-full justify-between font-normal"
												>
													{selectedAsset ? selectedAsset.label : "Chọn tài sản"}
												</Button>
											</FormControl>
										</PopoverTrigger>

										<PopoverContent className="p-0 w-full">
											<Command>
												<CommandInput placeholder="Tìm tài sản..." />
												<CommandList>
													<CommandEmpty>Không tìm tài sản</CommandEmpty>
													<CommandGroup>
														{assetOptions?.map((asset) => (
															<CommandItem
																key={asset.value}
																value={asset.value}
																onSelect={(val) => field.onChange(val)}
															>
																{asset.label}
																{field.value === asset.value && (
																	<Check className="ml-auto h-4 w-4 opacity-50" />
																)}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>

									<FormMessage className="text-xs" />
								</FormItem>
							);
						}}
					/>

					{/* Checklist */}
					<div className="space-y-2">
						<Label>Danh sách công việc</Label>

						<div className="flex gap-2">
							<Input
								placeholder="Nhập công việc cần làm"
								value={newTask}
								onChange={(e) => setNewTask(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addChecklistItem();
									}
								}}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={addChecklistItem}
							>
								<Plus className="w-4 h-4" />
							</Button>
						</div>

						{checklistItems.map((item, index) => (
							<div key={index} className="flex items-center gap-2">
								<Input disabled value={item.task} className="flex-1" />
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => removeChecklistItem(index)}
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				</form>
			</Form>
		</Modal>
	);
};

export default UpdateScheduledMaintenanceModal;
