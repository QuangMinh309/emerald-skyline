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
import { useCreateTechnician } from "@/hooks/data/useTechnicians";
import { toast } from "sonner";
import { TechnicianStatusOption } from "@/constants/technicianStatus";
import { Textarea } from "@/components/ui/textarea";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const CreateTechnicianSchema = z.object({
	fullName: z.string().min(1, "Vui lòng nhập họ tên"),
	phoneNumber: z
		.string()
		.min(10, "Số điện thoại phải có ít nhất 10 số")
		.regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
	status: z.string().min(1, "Vui lòng chọn trạng thái"),
	description: z.string().optional(),
});

type TechnicianFormValues = z.infer<typeof CreateTechnicianSchema>;

const CreateTechnicianModal = ({ open, setOpen }: ModalProps) => {
	const { mutate: createTechnician, isPending } = useCreateTechnician();

	const form = useForm<TechnicianFormValues>({
		resolver: zodResolver(CreateTechnicianSchema),
		defaultValues: {
			fullName: "",
			phoneNumber: "",
			status: "",
			description: "",
		},
	});

	function onSubmit(values: TechnicianFormValues) {
		createTechnician(
			{
				fullName: values.fullName,
				phoneNumber: values.phoneNumber,
				status: values.status,
				description: values.description || null,
			},
			{
				onSuccess: () => {
					toast.success("Kỹ thuật viên đã được tạo thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi khi tạo kỹ thuật viên",
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
			title="Tạo kỹ thuật viên mới"
			submitText="Tạo mới"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Họ tên */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Họ và tên</FormLabel>
									<FormControl>
										<Input placeholder="Nhập họ và tên" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Số điện thoại */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="phoneNumber"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Số điện thoại</FormLabel>
									<FormControl>
										<Input placeholder="Nhập số điện thoại" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Trạng thái */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Trạng thái</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn trạng thái" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{TechnicianStatusOption.map((option) => (
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

						{/* Mô tả */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="space-y-1.5 col-span-2">
									<FormLabel>Mô tả</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Nhập mô tả (nếu có)"
											rows={3}
											{...field}
										/>
									</FormControl>
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

export default CreateTechnicianModal;
