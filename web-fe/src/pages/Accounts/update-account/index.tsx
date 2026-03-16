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
import { useGetAccountById, useUpdateAccount } from "@/hooks/data/useAccounts";
import { toast } from "sonner";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface UpdateAccountModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	accountId?: number;
}

const UpdateAccountSchema = z.object({
	email: z.string().email("Email không hợp lệ"),
	password: z.string().optional(),
	role: z.enum(["ADMIN", "RESIDENT", "TECHNICIAN"]),
	isActive: z.boolean(),
});

type AccountFormValues = z.infer<typeof UpdateAccountSchema>;

const UpdateAccountModal = ({
	open,
	setOpen,
	accountId,
}: UpdateAccountModalProps) => {
	const { data: account } = useGetAccountById(accountId!);
	const { mutate: updateAccount, isPending } = useUpdateAccount();

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(UpdateAccountSchema),
		defaultValues: {
			email: "",
			password: "",
			role: "RESIDENT",
			isActive: true,
		},
	});

	useEffect(() => {
		if (account && open) {
			form.reset({
				email: account.email,
				password: "",
				role: account.role,
				isActive: account.isActive,
			});
		}
	}, [account, open, form]);

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	function onSubmit(values: AccountFormValues) {
		if (!account?.id) return;

		const updateData: any = {
			email: values.email,
			role: values.role,
			isActive: values.isActive,
		};

		if (values.password && values.password.trim()) {
			updateData.password = values.password;
		}

		updateAccount(
			{
				id: account.id,
				data: updateData,
			},
			{
				onSuccess: () => {
					toast.success("Cập nhật tài khoản thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(
						error.response?.data?.message || "Lỗi cập nhật tài khoản",
					);
				},
			},
		);
	}

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Chỉnh sửa tài khoản"
			submitText="Lưu thay đổi"
			onSubmit={form.handleSubmit(onSubmit)}
			onLoading={isPending}
		>
			<Form {...form}>
				<form className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="example@email.com"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel>Mật khẩu mới (để trống nếu không đổi)</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Nhập mật khẩu mới"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="role"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Vai trò</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Chọn vai trò" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="ADMIN">Quản trị viên</SelectItem>
										<SelectItem value="RESIDENT">Cư dân</SelectItem>
										<SelectItem value="TECHNICIAN">Kỹ thuật viên</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isActive"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-3">
								<div className="space-y-0.5">
									<FormLabel>Trạng thái hoạt động</FormLabel>
									<div className="text-sm text-muted-foreground">
										Bật/tắt trạng thái tài khoản
									</div>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</Modal>
	);
};

export default UpdateAccountModal;
