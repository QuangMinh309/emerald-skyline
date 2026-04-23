"use client";

import { useState } from "react";
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
import { addSeconds } from "date-fns";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useCreateNotification } from "@/hooks/data/useNotifications";
import { ScopeSelector } from "@/components/common/ScopeSelector";
import { UploadFiles } from "@/components/common/UploadFiles";
import { DateTimePicker } from "@/components/common/DateTimePicker";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const typeMap: Record<string, { label: string; className: string }> = {
	POLICY: {
		label: "Chính sách",
		className: "text-purple-700",
	},
	MAINTENANCE: {
		label: "Bảo trì",
		className: "text-emerald-700",
	},
	WARNING: {
		label: "Cảnh báo",
		className: "text-orange-700",
	},
	GENERAL: {
		label: "Thông báo chung",
		className: "text-blue-700",
	},
	default: {
		label: "Chọn loại tin",
		className: "text-muted-foreground",
	},
};

//validate
const CreateSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập tiêu đề"),
	type: z.string().min(1, "Vui lòng chọn loại tin"),
	content: z.string().min(1, "Vui lòng nhập nội dung"),
	isUrgent: z.string(),
	targetScope: z.enum(["ALL", "BLOCK", "FLOOR"]),
	publishedAt: z.date({ message: "Vui lòng chọn ngày đăng" }),
	targetBlocks: z.array(
		z.object({
			blockId: z.string(),
			floorNumbers: z.array(z.string()),
		}),
	),
	channels: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 kênh gửi"),
});

type FormValues = z.infer<typeof CreateSchema>;

const CreateNotificationModal = ({ open, setOpen }: ModalProps) => {
	const { mutate: createNoti, isPending } = useCreateNotification();
	const [docFiles, setDocFiles] = useState<File[]>([]);

	const form = useForm<FormValues>({
		resolver: zodResolver(CreateSchema),
		defaultValues: {
			title: "",
			type: "GENERAL",
			content: "",
			isUrgent: "false",
			targetScope: "ALL",
			targetBlocks: [],
			channels: ["APP"],
		},
	});

	const handleClose = () => {
		setOpen(false);
		form.reset();
		setDocFiles([]);
	};

	function onSubmit(values: FormValues) {
		if (values.targetScope !== "ALL" && values.targetBlocks.length === 0) {
			toast.error("Vui lòng chọn ít nhất 1 tòa nhà áp dụng");
			return;
		}
		if (values.targetScope === "FLOOR") {
			const hasEmpty = values.targetBlocks.some(
				(b) => b.floorNumbers.length === 0,
			);
			if (hasEmpty) {
				toast.error("Vui lòng chọn tầng chi tiết cho các tòa nhà đã chọn");
				return;
			}
		}

		const formattedBlocks =
			values.targetScope === "ALL"
				? []
				: values.targetBlocks.map((b) => ({
						blockId: Number(b.blockId), // Convert string -> number
						targetFloorNumbers:
							values.targetScope === "BLOCK" ? [] : b.floorNumbers,
					}));

		const payload = {
			title: values.title,
			publishedAt: values.publishedAt,
			type: values.type,
			content: values.content,
			isUrgent: values.isUrgent === "true",
			targetScope: values.targetScope,
			channels: values.channels,
			targetBlocks: formattedBlocks,
			files: docFiles,
		};

		// console.log("Payload sending from Modal:", payload);

		createNoti(payload as any, {
			onSuccess: () => {
				toast.success("Tạo thông báo thành công");
				handleClose();
			},
			onError: (err: any) => {
				// console.error("Lỗi API Create:", err.response?.data);
				const msgs = err.response?.data?.message;
				const msg = Array.isArray(msgs) ? msgs[0] : err.message;
				toast.error(msg || "Lỗi tạo thông báo");
			},
		});
	}

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Tạo thông báo mới"
			submitText="Tạo mới"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel isRequired>Tiêu đề</FormLabel>
								<FormControl>
									<Input placeholder="Ví dụ: Thông báo bảo trì..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="publishedAt"
						render={({ field }) => (
							<FormItem>
								<FormLabel isRequired>Ngày đăng</FormLabel>
								<FormControl>
									<DateTimePicker
										value={field.value}
										onChange={field.onChange}
										placeholder="Chọn thời gian đăng tin"
										minDate={addSeconds(new Date(), 5)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => {
								const type = typeMap[field.value] ?? typeMap.default;

								return (
									<FormItem>
										<FormLabel isRequired>Loại tin</FormLabel>

										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<span className={`text-sm ${type.className}`}>
														{type.label}
													</span>
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												<SelectItem value="POLICY">
													<span className="text-purple-600">Chính sách</span>
												</SelectItem>
												<SelectItem value="MAINTENANCE">
													<span className="text-emerald-600">Bảo trì</span>
												</SelectItem>
												<SelectItem value="WARNING">
													<span className="text-orange-600">Cảnh báo</span>
												</SelectItem>
												<SelectItem value="GENERAL">
													<span className="text-blue-600">Thông báo chung</span>
												</SelectItem>
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								);
							}}
						/>

						<FormField
							control={form.control}
							name="isUrgent"
							render={({ field }) => {
								const isUrgent = field.value === "true";

								return (
									<FormItem>
										<FormLabel isRequired>Mức độ</FormLabel>

										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													{isUrgent ? (
														<span className="text-orange-600">
															Thông báo khẩn
														</span>
													) : (
														<span className="text-sm">Bình thường</span>
													)}
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												<SelectItem value="false">
													<span>Bình thường</span>
												</SelectItem>

												<SelectItem value="true">
													<span className="text-orange-600">
														Thông báo khẩn
													</span>
												</SelectItem>
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>

					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormLabel isRequired>Nội dung chi tiết</FormLabel>
								<FormControl>
									<Textarea
										className="h-24"
										placeholder="Nhập nội dung..."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="pt-2">
						<UploadFiles files={docFiles} onChange={setDocFiles} />
					</div>

					<FormField
						control={form.control}
						name="targetScope"
						render={({ field }) => (
							<FormItem>
								<ScopeSelector
									targetScope={field.value}
									onScopeChange={(val) => {
										field.onChange(val);
										form.setValue("targetBlocks", []);
									}}
									selectedBlocks={form.watch("targetBlocks")}
									onChangeBlocks={(blocks) =>
										form.setValue("targetBlocks", blocks)
									}
								/>
							</FormItem>
						)}
					/>

					<div className="pt-4">
						<FormField
							control={form.control}
							name="channels"
							render={() => (
								<FormItem>
									<FormLabel isRequired>Kênh gửi thông báo</FormLabel>
									<div className="flex flex-row gap-6 mt-3">
										{[
											{ id: "APP", label: "Phần mềm Emerald Tower" },
											{ id: "EMAIL", label: "Email cư dân" },
										].map((item) => (
											<FormField
												key={item.id}
												control={form.control}
												name="channels"
												render={({ field }) => (
													<FormItem
														key={item.id}
														className="flex flex-row items-center space-x-2 space-y-0"
													>
														<FormControl>
															<Checkbox
																checked={field.value?.includes(item.id)}
																onCheckedChange={(checked) => {
																	return checked
																		? field.onChange([...field.value, item.id])
																		: field.onChange(
																				field.value?.filter(
																					(value) => value !== item.id,
																				),
																			);
																}}
															/>
														</FormControl>
														<FormLabel className="font-normal cursor-pointer text-sm">
															{item.label}
														</FormLabel>
													</FormItem>
												)}
											/>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</Modal>
	);
};

export default CreateNotificationModal;
