"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/common/Modal";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";

import { useCreateService } from "@/hooks/data/useServices";
import { UploadImages } from "@/components/common/UploadImages";
import type { ServiceType } from "@/types/service";

const formatVNDInput = (v: string) => {
	if (!v) return "";
	return new Intl.NumberFormat("vi-VN").format(Number(v));
};

const digitsOnly = (text: string) => text.replace(/\D/g, "");
const toMinutes = (t: string) => {
	const [h, m] = t.split(":").map(Number);
	return h * 60 + m;
};

const durationMinutes = (open: string, close: string) => {
	const a = toMinutes(open);
	const b = toMinutes(close);
	return b > a ? b - a : 24 * 60 - a + b;
};

const formatDuration = (mins: number) => {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	if (h === 0) return `${m} phút`;
	if (m === 0) return `${h} giờ`;
	return `${h} giờ ${m} phút`;
};

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const CreateServiceSchema = z
	.object({
		name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
		description: z.string().optional(),
		unitPrice: z
			.string()
			.min(1, "Vui lòng nhập giá")
			.refine((v) => !Number.isNaN(Number(v)), "Giá không hợp lệ")
			.refine((v) => Number(v) > 0, "Giá phải > 0"),
		unitTimeBlock: z.string().min(1, "Vui lòng chọn đơn vị"),
		openHour: z.string().min(1, "Vui lòng chọn giờ mở cửa"),
		closeHour: z.string().min(1, "Vui lòng chọn giờ đóng cửa"),
		totalSlot: z
			.string()
			.min(1, "Vui lòng nhập sức chứa")
			.refine((v) => Number(v) > 0, "Sức chứa phải lớn hơn 0"),
		type: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const unit = Number(data.unitTimeBlock || 0);
		if (!unit) return;

		const dur = durationMinutes(data.openHour, data.closeHour);

		if (dur < unit) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["closeHour"],
				message: `Tổng thời gian hoạt động phải từ ${unit} phút trở lên`,
			});
		}
	});

type ServiceFormValues = z.infer<typeof CreateServiceSchema>;

const CreateServiceModal = ({ open, setOpen }: ModalProps) => {
	const { mutate: createService, isPending } = useCreateService();
	const [image, setImage] = useState<File[]>([]);

	const form = useForm<ServiceFormValues>({
		resolver: zodResolver(CreateServiceSchema),
		defaultValues: {
			name: "",
			description: "",
			unitPrice: "",
			unitTimeBlock: "60",
			openHour: "06:00",
			closeHour: "17:00",
			totalSlot: "",
			type: "NORMAL",
		},
	});
	const openHour = form.watch("openHour");
	const closeHour = form.watch("closeHour");
	const isOvernight =
		openHour && closeHour && toMinutes(closeHour) < toMinutes(openHour);
	const dur =
		openHour && closeHour ? durationMinutes(openHour, closeHour) : null;

	const hourOptions = useMemo(() => {
		const options: { value: string; label: string }[] = [];

		for (let h = 0; h < 24; h++) {
			const hh = String(h).padStart(2, "0");

			// :00
			options.push({
				value: `${hh}:00`,
				label: `${h}h`,
			});
			// :15
			options.push({
				value: `${hh}:15`,
				label: `${h}h15`,
			});
			// :30
			options.push({
				value: `${hh}:30`,
				label: `${h}h30`,
			});
			// :45
			options.push({
				value: `${hh}:45`,
				label: `${h}h45`,
			});
		}
		return options;
	}, []);
	const unitOptions = useMemo(
		() => [
			{ value: "15", label: "15 phút" },
			{ value: "30", label: "30 phút" },
			{ value: "60", label: "60 phút" },
		],
		[],
	);

	const typeOptions = useMemo(() => {
		const opts: { value: ServiceType; label: string }[] = [
			{ value: "NORMAL", label: "Bình thường" },
			{ value: "COMMUNITY", label: "Cộng đồng" },
		];
		return opts;
	}, []);

	useEffect(() => {
		if (open) {
			setImage([]);
		}
	}, [open]);

	const handleClose = () => {
		setOpen(false);
		form.reset();
		setImage([]);
	};

	async function onSubmit(values: ServiceFormValues) {
		if (isPending) return;

		const formData = new FormData();
		formData.append("name", values.name);
		formData.append("description", values.description ?? "");
		formData.append("unitPrice", digitsOnly(values.unitPrice));
		formData.append("unitTimeBlock", String(values.unitTimeBlock));
		formData.append("openHour", values.openHour);
		formData.append("closeHour", values.closeHour);
		formData.append("totalSlot", String(values.totalSlot));
		formData.append("type", values.type ?? "NORMAL");

		if (image.length > 0) {
			formData.append("image", image[0]);
		}

		createService(formData as any, {
			onSuccess: () => {
				toast.success("Dịch vụ đã được tạo thành công");
				handleClose();
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi tạo dịch vụ");
			},
		});
	}

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Thêm dịch vụ mới"
			submitText="Tạo mới"
			onSubmit={form.handleSubmit(onSubmit)}
			onLoading={isPending}
		>
			<Form {...form}>
				<form className="space-y-4">
					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Tên dịch vụ */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Tên dịch vụ</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên dịch vụ" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Giá */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="unitPrice"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Giá</FormLabel>
									<FormControl>
										<Input
											type="text"
											inputMode="numeric"
											value={formatVNDInput(String(field.value ?? ""))}
											onChange={(e) =>
												field.onChange(digitsOnly(e.target.value))
											}
											placeholder="Nhập giá"
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Đơn vị */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="unitTimeBlock"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Đơn vị</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn đơn vị" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{unitOptions.map((u) => (
												<SelectItem key={u.value} value={u.value}>
													{u.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<FormField
							disabled={isPending}
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Loại dịch vụ</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value ?? "NORMAL"}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn loại" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{typeOptions.map((t) => (
												<SelectItem key={t.value} value={t.value}>
													{t.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>
					{/* Mô tả */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Mô tả</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Nhập mô tả..."
										className="resize-none h-24"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
					<div className="border-t pt-4" />

					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Giờ mở cửa */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="openHour"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Giờ mở cửa</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn giờ" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{hourOptions.map((opt) => (
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

						{/* Giờ đóng cửa */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="closeHour"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Giờ đóng cửa</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn giờ" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{hourOptions.map((opt) => (
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
					</div>

					{openHour && closeHour && (
						<p className="mt-1 text-xs text-neutral-500">
							{isOvernight ? "Dịch vụ qua đêm. " : ""}
							{dur !== null
								? `Tổng thời gian hoạt động: ${formatDuration(dur)}`
								: ""}
						</p>
					)}

					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Sức chứa / đơn vị thời gian */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="totalSlot"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Sức chứa</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											placeholder="Nhập sức chứa"
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value)}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>

					{/* Image */}
					<UploadImages
						files={image}
						onChange={(files) => {
							setImage(files);
						}}
						maxImages={1}
					/>
				</form>
			</Form>
		</Modal>
	);
};

export default CreateServiceModal;
