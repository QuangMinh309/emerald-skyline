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
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
	useMaintenanceTicketDetail,
	useUpdateIncidentTicket,
} from "@/hooks/data/useMaintenance";
import {
	TicketPriority,
	TicketPriorityOptions,
} from "@/constants/ticketPriority";
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
import { useAssets } from "@/hooks/data/useAssests";

interface UpdateModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	ticketId?: number;
}

const UpdateIncidentMaintenanceSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập tiêu đề"),
	description: z.string().optional(),
	priority: z.string().optional(),
	assetId: z.string().min(1, "Vui lòng chọn tài sản"),
});

type IncidentMaintenanceFormValues = z.infer<
	typeof UpdateIncidentMaintenanceSchema
>;

/* =======================
   Component
======================= */

const UpdateIncidentMaintenanceModal = ({
	open,
	setOpen,
	ticketId,
}: UpdateModalProps) => {
	const { data: ticket } = useMaintenanceTicketDetail(ticketId!);
	const { data: assets } = useAssets();
	const { mutate: updateTicket, isPending } = useUpdateIncidentTicket();

	const form = useForm<IncidentMaintenanceFormValues>({
		resolver: zodResolver(UpdateIncidentMaintenanceSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: "",
			assetId: "",
		},
	});

	/* =======================
     Init data
  ======================= */

	useEffect(() => {
		if (ticket && open) {
			form.reset({
				title: ticket.title,
				description: ticket.description || "",
				priority: ticket.priority || "",
				assetId: ticket.assetId?.toString() || "",
			});
		}
	}, [ticket, open, form]);

	const assetOptions = assets?.map((asset) => ({
		value: asset.id.toString(),
		label: `${asset.name} - Toà ${asset.blockName} - Tầng ${asset.floor}`,
	}));

	/* =======================
     Checklist handlers
  ======================= */

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	/* =======================
     Submit
  ======================= */

	function onSubmit(values: IncidentMaintenanceFormValues) {
		if (!ticketId) return;

		updateTicket(
			{
				id: ticketId,
				data: {
					title: values.title,
					description: values.description,
					priority: values.priority as TicketPriority | undefined,
					assetId: Number(values.assetId),
				},
			},
			{
				onSuccess: () => {
					toast.success("Cập nhật yêu cầu bảo trì thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi cập nhật yêu cầu bảo trì",
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
			title="Chỉnh sửa yêu cầu bảo trì do sự cố"
			submitText="Lưu thay đổi"
			onSubmit={form.handleSubmit(onSubmit)}
			onLoading={isPending}
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

						{/* Tài sản */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="assetId"
							render={({ field }) => {
								const selectedAsset = assetOptions?.find(
									(a) => a.value === field.value,
								);

								return (
									<FormItem className="col-span-2 space-y-1.5">
										<FormLabel isRequired>Tài sản liên quan</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className="w-full justify-between font-normal"
													>
														{selectedAsset
															? selectedAsset.label
															: "Chọn tài sản"}
													</Button>
												</FormControl>
											</PopoverTrigger>

											<PopoverContent className="p-0 w-full">
												<Command>
													<CommandInput placeholder="Tìm tài sản..." />
													<CommandList>
														<CommandEmpty>Không tìm thấy tài sản</CommandEmpty>
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

						{/* Mô tả */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="col-span-2 space-y-1.5">
									<FormLabel>Mô tả chi tiết</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Độ ưu tiên */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Độ ưu tiên</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn độ ưu tiên" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{TicketPriorityOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</Modal>
	);
};

export default UpdateIncidentMaintenanceModal;
