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
import { useAssignTechnician } from "@/hooks/data/useMaintenance";
import { toast } from "sonner";
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
import { useTechnicians } from "@/hooks/data/useTechnicians";
import { Check } from "lucide-react";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	ticketId?: number;
}

const AssignTechnicianSchema = z.object({
	technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
	estimatedCost: z.number().min(1, "Chi phí ước tính phải > 0"),
});

type AssignFormValues = z.infer<typeof AssignTechnicianSchema>;

const AssignTechnicianModal = ({ open, setOpen, ticketId }: ModalProps) => {
	const { mutate: assignTechnician, isPending } = useAssignTechnician();

	const form = useForm<AssignFormValues>({
		resolver: zodResolver(AssignTechnicianSchema),
		defaultValues: {
			technicianId: "",
			estimatedCost: 0,
		},
	});

	// TODO: Lấy danh sách technicians từ API
	// Tạm thời hardcode để demo
	const { data: technicians } = useTechnicians();
	const technicianOptions = technicians?.map((technician) => ({
		value: technician.id.toString(),
		label: `${technician.fullName} - ${technician.phoneNumber}`,
	}));
	function onSubmit(values: AssignFormValues) {
		if (!ticketId) return;

		assignTechnician(
			{
				id: ticketId,
				data: {
					technicianId: Number(values.technicianId),
					estimatedCost: values.estimatedCost,
				},
			},
			{
				onSuccess: () => {
					toast.success("Đã giao việc cho kỹ thuật viên thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message ||
							"Lỗi khi giao việc cho kỹ thuật viên",
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
			title="Giao việc cho kỹ thuật viên"
			submitText="Giao việc"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					{/* Kỹ thuật viên */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="technicianId"
						render={({ field }) => {
							const selectedTechnician = technicianOptions?.find(
								(r) => r.value === field.value,
							);

							return (
								<FormItem className="space-y-1.5  col-span-2">
									<FormLabel isRequired>Kỹ thuật viên</FormLabel>

									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className="w-full justify-between font-normal"
												>
													{selectedTechnician
														? selectedTechnician.label
														: "Chọn kỹ thuật viên"}
												</Button>
											</FormControl>
										</PopoverTrigger>

										<PopoverContent className="p-0 w-full">
											<Command>
												<CommandInput placeholder="Tìm kỹ thuật viên..." />
												<CommandList>
													<CommandEmpty>Không tìm kỹ thuật viên</CommandEmpty>
													<CommandGroup>
														{technicianOptions?.map((resident) => (
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

					<FormField
						disabled={isPending}
						control={form.control}
						name="estimatedCost"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Giá ước tính (VND)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="1"
										placeholder="Nhập giá ước tính"
										value={field.value ?? ""}
										onChange={(e) => field.onChange(Number(e.target.value))}
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

export default AssignTechnicianModal;
