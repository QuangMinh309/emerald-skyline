"use client";

import { useEffect } from "react";
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
import {
	TicketPriority,
	TicketPriorityOptions,
} from "@/constants/ticketPriority";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIncidentTicket } from "@/hooks/data/useMaintenance";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { useAssets } from "@/hooks/data/useAssests";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: (ticketId: number) => void;
	onDataSubmit?: (data: {
		title: string;
		description?: string;
		priority?: string;
		assetId: number;
	}) => void;
	initialData?: {
		title?: string;
		description?: string;
	};
}

const CreateIncidentMaintenanceSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập tiêu đề"),
	description: z.string().optional(),
	priority: z.string().optional(),
	assetId: z.string().min(1, "Vui lòng chọn tài sản"),
});

type IncidentMaintenanceFormValues = z.infer<
	typeof CreateIncidentMaintenanceSchema
>;

const CreateIncidentMaintenanceModal = ({
	open,
	setOpen,
	onSuccess,
	onDataSubmit,
	initialData,
}: ModalProps) => {
	const { mutate: createTicket, isPending } = useCreateIncidentTicket();
	const { data: assets } = useAssets();
	const form = useForm<IncidentMaintenanceFormValues>({
		resolver: zodResolver(CreateIncidentMaintenanceSchema),
		defaultValues: {
			title: "",
			description: "",
			priority: "",
			assetId: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (initialData) {
				form.reset({
					title: initialData.title || "",
					description: initialData.description || "",
					priority: "",
					assetId: "",
				});
			} else {
				form.reset({
					title: "",
					description: "",
					priority: "",
					assetId: "",
				});
			}
		}
	}, [open, initialData, form]);

	const assetOptions = assets?.map((asset) => ({
		value: asset.id.toString(),
		label: `${asset.name} - Toà ${asset.blockName} - Tầng ${asset.floor}`,
	}));

	function onSubmit(values: IncidentMaintenanceFormValues) {
		// Nếu có onDataSubmit, chỉ trả về data thay vì tạo ticket
		if (onDataSubmit) {
			onDataSubmit({
				title: values.title,
				description: values.description,
				assetId: parseInt(values.assetId),
				priority: values.priority,
			});
			handleClose();
			return;
		}

		// Logic tạo ticket bình thường
		createTicket(
			{
				title: values.title,
				description: values.description,
				assetId: parseInt(values.assetId),
				priority: values.priority as TicketPriority | undefined,
				type: "INCIDENT",
			},
			{
				onSuccess: (response: any) => {
					toast.success("Yêu cầu bảo trì đã được tạo thành công");
					const newTicketId = response?.data?.id || response?.id;

					if (onSuccess && newTicketId) {
						onSuccess(newTicketId);
					}

					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi khi tạo yêu cầu bảo trì",
					);
				},
			},
		);
	}

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Tạo yêu cầu bảo trì do sự cố"
			submitText="Tạo mới"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Tiêu đề */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="space-y-1.5 col-span-2">
									<FormLabel isRequired>Tiêu đề</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tiêu đề yêu cầu" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<FormField
							disabled={isPending}
							control={form.control}
							name="assetId"
							render={({ field }) => {
								const selectedAsset = assetOptions?.find(
									(r) => r.value === field.value,
								);

								return (
									<FormItem className="space-y-1.5  col-span-2">
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
														<CommandEmpty>Không tìm tài sản</CommandEmpty>
														<CommandGroup>
															{assetOptions?.map((resident) => (
																<CommandItem
																	key={resident.value}
																	value={resident.value}
																	onSelect={(val) => {
																		field.onChange(val);
																	}}
																>
																	{resident.label}
																	{field.value === resident.value && (
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
								<FormItem className="space-y-1.5 col-span-2">
									<FormLabel>Mô tả chi tiết</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Nhập mô tả chi tiết (nếu có)"
											rows={3}
											{...field}
										/>
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
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
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

export default CreateIncidentMaintenanceModal;
