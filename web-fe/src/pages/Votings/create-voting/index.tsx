"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
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
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addSeconds } from "date-fns";

import { ScopeSelector } from "@/components/common/ScopeSelector";
import { UploadFiles } from "@/components/common/UploadFiles";
import { DateTimePicker } from "@/components/common/DateTimePicker";

import { useCreateVoting } from "@/hooks/data/useVotings";

const CreateVotingSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập chủ đề"),
	content: z.string().optional(),
	startTime: z.date({
		message: "Chọn ngày bắt đầu",
	}),
	endTime: z.date({
		message: "Chọn ngày kết thúc",
	}),
	isRequired: z.string(),
	targetScope: z.enum(["ALL", "BLOCK", "FLOOR"]),
	targetBlocks: z
		.array(z.object({ blockId: z.string(), floorNumbers: z.array(z.string()) }))
		.optional(),
	options: z
		.array(
			z.object({
				name: z.string().min(1, "Nhập tên phương án"),
				description: z.string(),
			}),
		)
		.min(2, "Cần ít nhất 2 phương án"),
});

type FormValues = z.infer<typeof CreateVotingSchema>;

const CreateVotingPage = () => {
	const navigate = useNavigate();
	const { mutate: createVoting, isPending } = useCreateVoting();
	const [files, setFiles] = useState<File[]>([]);

	const form = useForm<FormValues>({
		resolver: zodResolver(CreateVotingSchema) as any,
		defaultValues: {
			title: "",
			content: "",
			isRequired: "false",
			targetScope: "ALL",
			targetBlocks: [],
			options: [
				{ name: "", description: "" },
				{ name: "", description: "" },
			],
		},
	});

	const { fields, append, remove } = useFieldArray<FormValues>({
		control: form.control,
		name: "options",
	});

	const onSubmit = (values: FormValues) => {
		if (
			values.targetScope !== "ALL" &&
			(!values.targetBlocks || values.targetBlocks.length === 0)
		) {
			toast.error("Vui lòng chọn ít nhất 1 tòa nhà áp dụng");
			return;
		}

		const formattedBlocks =
			values.targetScope === "ALL"
				? [] // nếu ALL thì không cần gửi block
				: values.targetBlocks?.map((b) => ({
						blockId: Number(b.blockId),
						targetFloorNumbers:
							values.targetScope === "BLOCK" ? [] : b.floorNumbers,
					})) || [];

		const payload = {
			...values,
			startTime: values.startTime.toISOString(),
			endTime: values.endTime.toISOString(),
			isRequired: values.isRequired === "true",
			targetScope: values.targetScope,

			targetBlocks: formattedBlocks,

			files: files,
			options: values.options.map((opt) => ({
				name: opt.name,
				description: opt.description.trim() || undefined,
			})),
		};

		createVoting(payload as any, {
			onSuccess: () => {
				toast.success("Tạo biểu quyết thành công");
				navigate("/votings");
			},
			onError: (err: any) => {
				const apiMessage = err?.response?.data?.message;

				if (apiMessage) {
					toast.error(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage);
				} else {
					toast.error("Lỗi tạo biểu quyết");
				}
			},
		});
	};

	const startTimeValue = form.watch("startTime");

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader title="Tạo biểu quyết" showBack />

			<div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<div className="md:col-span-2">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel isRequired>Chủ đề</FormLabel>
											<FormControl>
												<Input
													placeholder="Ví dụ: Bảo trì hệ thống nước tháng 11"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div>
								<div className="space-y-2">
									<Label>Trạng thái</Label>
									<div className="h-9 flex items-center">
										<span className="text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-md text-sm border border-purple-100">
											Sắp diễn ra
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel isRequired>Ngày bắt đầu</FormLabel>
										<FormControl>
											<DateTimePicker
												value={field.value}
												onChange={field.onChange}
												placeholder="Chọn ngày giờ bắt đầu"
												// +5 giây từ hiện tại
												minDate={addSeconds(new Date(), 5)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel isRequired>Ngày kết thúc</FormLabel>
										<FormControl>
											<DateTimePicker
												value={field.value}
												onChange={field.onChange}
												placeholder="Chọn ngày giờ kết thúc"
												// phải sau ngày bắt đầu (hoặc sau hiện tại)
												minDate={
													startTimeValue ? new Date(startTimeValue) : new Date()
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isRequired"
								render={({ field }) => (
									<FormItem>
										<FormLabel isRequired>Tính chất</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="false">
													<span className="text-blue-600 font-medium">
														Tự nguyện
													</span>
												</SelectItem>
												<SelectItem value="true">
													<span className="text-red-600 font-medium">
														Bắt buộc
													</span>
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mô tả</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-[120px]"
											placeholder="Nhập mô tả..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-3">
							<FormField
								control={form.control}
								name="options"
								render={() => (
									<FormItem>
										<FormLabel isRequired>Phương án</FormLabel>

										<div className="space-y-4 border rounded-md p-6 bg-gray-50/50 mt-2">
											{fields.map((field, index) => (
												<div
													key={field.id}
													className="relative bg-white p-4 rounded border border-gray-200 shadow-sm"
												>
													<div className="absolute right-2 top-2">
														{fields.length > 2 && (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-red-500 hover:text-red-700"
																onClick={() => remove(index)}
															>
																<Trash2 className="w-6 h-6" />
															</Button>
														)}
													</div>
													<div className="space-y-3">
														<FormField
															control={form.control}
															name={`options.${index}.name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel
																		isRequired
																		className="text-gray-500"
																	>
																		Tiêu đề phương án
																	</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name={`options.${index}.description`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-gray-500">
																		Chi tiết
																	</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											))}

											<Button
												type="button"
												variant="outline"
												className="w-full h-10 border-dashed border-main text-main hover:bg-main/5"
												onClick={() => append({ name: "", description: "" })}
											>
												<Plus className="w-4 h-4 mr-2" /> Thêm phương án
											</Button>

											{/* FormMessage này sẽ hứng lỗi của cả mảng (VD: Cần tối thiểu 2 phương án) */}
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-3">
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
											label="Đối tượng biểu quyết"
											selectedBlocks={form.watch("targetBlocks") || []}
											onChangeBlocks={(blocks) =>
												form.setValue("targetBlocks", blocks)
											}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="pt-2 mt-6">
							<UploadFiles files={files} onChange={setFiles} />
						</div>

						<div className="-mx-6 mt-8">
							<div className="h-px w-full bg-gray-200" />
						</div>

						{/* FOOTER */}
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								className="w-24 border-gray-300"
								onClick={() => navigate("/votings")}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								className="w-24 bg-[#1F4E3D] hover:bg-[#16382b] text-white"
								disabled={isPending}
							>
								{isPending ? "Đang tạo..." : "Tạo mới"}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default CreateVotingPage;
