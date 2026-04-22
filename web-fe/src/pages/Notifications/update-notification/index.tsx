"use client";

import { useEffect, useState } from "react";
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
import { addMinutes } from "date-fns";
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
import {
	useNotification,
	useUpdateNotification,
} from "@/hooks/data/useNotifications";
import { Label } from "@/components/ui/label";
import FileAttachmentItem from "@/components/common/FileAttachmentItem";
import { ScopeSelector } from "@/components/common/ScopeSelector";
import { UploadFiles } from "@/components/common/UploadFiles";
import { DateTimePicker } from "@/components/common/DateTimePicker";

interface UpdateModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	notificationId?: number | undefined;
}

const typeMap: Record<string, { label: string; className: string }> = {
	POLICY: { label: "Chính sách", className: "text-purple-700" },
	MAINTENANCE: { label: "Bảo trì", className: "text-emerald-700" },
	WARNING: { label: "Cảnh báo", className: "text-orange-700" },
	GENERAL: { label: "Thông báo chung", className: "text-blue-700" },
	default: { label: "Chọn loại tin", className: "text-muted-foreground" },
};

const UpdateSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập tiêu đề"),
	publishedAt: z.date({ message: "Vui lòng chọn ngày đăng" }),
	type: z.string().min(1, "Vui lòng chọn loại tin"),
	content: z.string().min(1, "Vui lòng nhập nội dung"),
	isUrgent: z.string(),
	targetScope: z.enum(["ALL", "BLOCK", "FLOOR"]),

	// mảng chứa tòa nhà
	targetBlocks: z.array(
		z.object({
			blockId: z.string(),
			floorNumbers: z.array(z.string()),
		}),
	),

	channels: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 kênh gửi"),
});

type FormValues = z.infer<typeof UpdateSchema>;

const UpdateNotificationModal = ({
	open,
	setOpen,
	notificationId,
}: UpdateModalProps) => {
	const { data: notification } = useNotification(notificationId);
	const { mutate: updateNoti, isPending } = useUpdateNotification();

	// chỉ upload file mới
	const [newFiles, setNewFiles] = useState<File[]>([]);

	const form = useForm<FormValues>({
		resolver: zodResolver(UpdateSchema),
		defaultValues: {
			title: "",
			type: "GENERAL",
			content: "",
			isUrgent: "false",
			targetScope: "ALL",
			targetBlocks: [],
			channels: [],
		},
	});

	useEffect(() => {
		if (notification && open) {
			// map data từ api vào form
			const mappedBlocks =
				notification.targetBlocks?.map((b: any) => ({
					blockId: String(b.blockId),
					floorNumbers: b.targetFloorNumbers || [],
				})) || [];

			form.reset({
				title: notification.title,
				publishedAt: notification.publishedAt
					? new Date(notification.publishedAt)
					: new Date(),
				type: notification.type,
				content: notification.content,
				isUrgent: notification.isUrgent ? "true" : "false",
				targetScope: notification.targetScope as "ALL" | "BLOCK" | "FLOOR",
				targetBlocks: mappedBlocks,
				channels: notification.channels || ["APP"],
			});

			setNewFiles([]); // reset file upload mới
		}
	}, [notification, open, form]);

	const handleClose = () => {
		setOpen(false);
		form.reset();
		setNewFiles([]);
	};

	function onSubmit(values: FormValues) {
		if (!notificationId) return;

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
						blockId: Number(b.blockId),
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
			files: newFiles,
		};

		// console.log("Update payload:", payload);

		updateNoti(
			{
				id: notificationId,
				data: payload as any,
			},
			{
				onSuccess: () => {
					toast.success("Cập nhật thông báo thành công");
					handleClose();
				},
				onError: (err: any) => {
					const apiMessage = err?.response?.data?.message;

					if (apiMessage) {
						toast.error(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage);
					} else {
						toast.error("Lỗi tạo thông báo");
					}
				},
			},
		);
	}

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Cập nhật thông báo"
			submitText="Lưu thay đổi"
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
										minDate={addMinutes(new Date(), 15)}
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
										<Select onValueChange={field.onChange} value={field.value}>
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

					<div className="space-y-4">
						{notification?.fileUrls && notification.fileUrls.length > 0 && (
							<div className="space-y-3">
								<Label className="text-sm font-semibold text-gray-700">
									Tài liệu hiện có ({notification.fileUrls.length})
								</Label>

								<div className="grid grid-cols-1 gap-2">
									{notification.fileUrls.map((url: string, idx: number) => {
										const rawFileName =
											url.split("/").pop() || `Tài liệu ${idx + 1}`;
										const fileName = decodeURIComponent(
											rawFileName.split("?")[0],
										);

										return (
											<FileAttachmentItem
												key={idx}
												url={url}
												fileName={fileName}
											/>
										);
									})}
								</div>
							</div>
						)}

						<div className="space-y-2">
							<UploadFiles
								files={newFiles}
								onChange={setNewFiles}
								label={
									notification?.fileUrls?.length
										? "Tải thêm tài liệu"
										: "Tài liệu đính kèm"
								}
								maxFiles={10 - (notification?.fileUrls?.length || 0)}
							/>
							<p className="text-[12px] text-gray-500 italic">
								* Các tài liệu mới sẽ được thêm vào danh sách hiện có.
							</p>
						</div>
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

					<div>
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

export default UpdateNotificationModal;
