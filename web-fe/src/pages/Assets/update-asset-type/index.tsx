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
import { Textarea } from "@/components/ui/textarea";
import {
	useGetAssetTypeById,
	useUpdateAssetType,
} from "@/hooks/data/useAssests";
import { toast } from "sonner";
import { useEffect } from "react";

interface UpdateModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	assetTypeId?: number;
}

const UpdateAssetTypeSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên loại tài sản"),
	description: z.string().optional(),
});

type AssetTypeFormValues = z.infer<typeof UpdateAssetTypeSchema>;

const UpdateAssetTypeModal = ({
	open,
	setOpen,
	assetTypeId,
}: UpdateModalProps) => {
	const { data: assetType } = useGetAssetTypeById(assetTypeId!);
	const { mutate: updateAssetType, isPending } = useUpdateAssetType();

	const form = useForm<AssetTypeFormValues>({
		resolver: zodResolver(UpdateAssetTypeSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	// Cập nhật giá trị form khi assetType thay đổi
	useEffect(() => {
		if (assetType && open) {
			form.reset({
				name: assetType.name,
				description: assetType.description || "",
			});
		}
	}, [assetType, open, form]);

	function onSubmit(values: AssetTypeFormValues) {
		if (!assetTypeId) return;

		updateAssetType(
			{
				id: assetTypeId,
				data: {
					name: values.name,
					description: values.description,
				},
			},
			{
				onSuccess: () => {
					toast.success("Cập nhật loại tài sản thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi cập nhật loại tài sản",
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
			title="Chỉnh sửa loại tài sản"
			submitText="Lưu thay đổi"
			onSubmit={form.handleSubmit(onSubmit)}
			onLoading={isPending}
		>
			<Form {...form}>
				<form className="space-y-4 w-[300px]">
					{/* Tên loại tài sản */}
					<FormField
						disabled={isPending}
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Tên loại tài sản</FormLabel>
								<FormControl>
									<Input placeholder="Nhập tên loại tài sản" {...field} />
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
							<FormItem className="space-y-1.5">
								<FormLabel>Mô tả</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Nhập mô tả cho loại tài sản..."
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

export default UpdateAssetTypeModal;
