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
import { useCreateAssetType } from "@/hooks/data/useAssests";
import { toast } from "sonner";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

// Schema validation
const CreateAssetTypeSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên loại tài sản"),
	description: z.string().optional(),
});

type AssetTypeFormValues = z.infer<typeof CreateAssetTypeSchema>;

const CreateAssetTypeModal = ({ open, setOpen }: ModalProps) => {
	const { mutate: createAssetType, isPending } = useCreateAssetType();

	const form = useForm<AssetTypeFormValues>({
		resolver: zodResolver(CreateAssetTypeSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	function onSubmit(values: AssetTypeFormValues) {
		createAssetType(
			{
				name: values.name,
				description: values.description,
			},
			{
				onSuccess: () => {
					toast.success("Loại tài sản đã được tạo thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi khi tạo loại tài sản",
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
			title="Tạo loại tài sản mới"
			submitText="Tạo mới"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
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

export default CreateAssetTypeModal;
