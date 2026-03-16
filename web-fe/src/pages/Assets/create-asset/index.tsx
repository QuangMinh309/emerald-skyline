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
import { DatePicker } from "@/components/common/DatePicker";
import { useAssetTypes, useCreateAsset } from "@/hooks/data/useAssests";
import { useBlocks } from "@/hooks/data/useBlocks";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

// 1. Schema với thông báo lỗi thân thiện
const CreateAssetSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên thiết bị"),
	typeId: z.string().min(1, "Vui lòng chọn loại thiết bị"),
	status: z.string().min(1, "Vui lòng chọn trạng thái"),
	blockId: z.string().min(1, "Vui lòng chọn tòa nhà"),
	locationDetail: z.string().min(1, "Vui lòng nhập chi tiết vị trí"),
	floor: z.string().min(1, "Vui lòng chọn tầng"),
	installationDate: z.date({
		message: "Vui lòng chọn ngày lắp đặt",
	}),
	warrantyYears: z.number().min(0, "Năm bảo hành phải >= 0"),
	note: z.string().optional(),
	maintenanceIntervalMonths: z
		.number()
		.min(1, "Khoảng thời gian bảo dưỡng phải > 0"),
});

type AssetFormValues = z.infer<typeof CreateAssetSchema>;

const CreateAssetModal = ({ open, setOpen }: ModalProps) => {
	const { data: assestTypes } = useAssetTypes();
	const { data: blocks } = useBlocks();
	const { mutate: createAsset, isPending } = useCreateAsset();
	const form = useForm<AssetFormValues>({
		resolver: zodResolver(CreateAssetSchema),
		defaultValues: {
			name: "",
			status: "ACTIVE",
			note: "",
			typeId: "",
			floor: "",
			blockId: "",
			installationDate: undefined,
			warrantyYears: 0,
			maintenanceIntervalMonths: 0,
		},
	});
	// 1. Theo dõi giá trị blockId đã chọn
	const selectedBlockId = form.watch("blockId");

	// 2. Tạo buildingOptions
	const buildingOptions =
		blocks?.map((item) => ({
			value: item.id.toString(),
			label: item.buildingName,
		})) || [];

	// 3. Logic lấy floorOptions dựa trên block được chọn
	const floorOptions = useMemo(() => {
		if (!selectedBlockId || !blocks) return [];

		// Tìm tòa nhà đang được chọn trong danh sách blocks
		const selectedBlock = blocks.find(
			(b) => b.id.toString() === selectedBlockId,
		);

		if (!selectedBlock || !selectedBlock.totalFloors) return [];

		// Tạo mảng từ 1 đến số tầng của tòa nhà đó
		return Array.from({ length: selectedBlock.totalFloors }, (_, i) => ({
			value: (i + 1).toString(),
			label: `Tầng ${i + 1}`,
		}));
	}, [selectedBlockId, blocks]);

	// Reset tầng về rỗng nếu đổi tòa nhà
	useEffect(() => {
		form.setValue("floor", "");
	}, [selectedBlockId, form]);
	const assetTypeOptions = assestTypes?.map((item) => ({
		value: item.id.toString(),
		label: item.name,
	}));

	function onSubmit(values: AssetFormValues) {
		createAsset(
			{
				name: values.name,
				typeId: Number(values.typeId),
				status: values.status,
				blockId: Number(values.blockId),
				locationDetail: values.locationDetail,
				floor: Number(values.floor),
				installationDate: values.installationDate.toISOString(),
				warrantyYears: values.warrantyYears,
				note: values.note,
				maintenanceIntervalMonths: values.maintenanceIntervalMonths,
			},
			{
				onSuccess: () => {
					toast.success("Tài sản đã được tạo thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Lỗi khi tạo tài sản");
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
			title="Tạo tài sản mới"
			submitText="Tạo mới"
			onLoading={isPending}
			// Kích hoạt submit qua hook form
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4 ">
					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Tên thiết bị */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Tên thiết bị</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên thiết bị" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Loại thiết bị */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="typeId"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Loại thiết bị</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn loại thiết bị" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{assetTypeOptions?.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
								<FormItem>
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
											<SelectItem value="ACTIVE">Hoạt động (Active)</SelectItem>
											<SelectItem value="INACTIVE">
												Ngưng hoạt động (Inactive)
											</SelectItem>
											<SelectItem value="MAINTENANCE">
												Bảo trì (Maintenance)
											</SelectItem>
											<SelectItem value="BROKEN">Hỏng (Broken)</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Tòa nhà */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="blockId"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Tòa</FormLabel>
									<Select onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn tòa" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{buildingOptions.map((building) => (
												<SelectItem key={building.value} value={building.value}>
													{building.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Tầng */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="floor"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Tầng</FormLabel>
									<Select onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn tầng" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{floorOptions.map((floor) => (
												<SelectItem key={floor.value} value={floor.value}>
													{floor.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Mô tả chi tiết */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="locationDetail"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Địa chỉ chi tiết</FormLabel>
									<FormControl>
										<Input placeholder="VD: Sảnh chính" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Ngày lắp đặt */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="installationDate"
							render={({ field }) => (
								<FormItem className="space-y-1.5 ">
									<FormLabel isRequired>Ngày lắp đặt</FormLabel>
									<FormControl>
										<DatePicker value={field.value} onChange={field.onChange} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Số năm bảo hành */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="warrantyYears"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Số năm bảo hành</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											placeholder="Nhập số năm bảo hành"
											value={field.value ?? ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						{/* Số năm bảo hành */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="maintenanceIntervalMonths"
							render={({ field }) => (
								<FormItem className="space-y-1.5 col-span-2">
									<FormLabel isRequired>
										Khoảng thời gian bảo trì (tháng)
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											placeholder="Nhập khoảng thời gian bảo trì (tháng)"
											value={field.value ?? ""}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>

					{/* Ghi chú */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Ghi chú</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Ghi chú thêm..."
										className="resize-none h-24"
										{...field}
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

export default CreateAssetModal;
