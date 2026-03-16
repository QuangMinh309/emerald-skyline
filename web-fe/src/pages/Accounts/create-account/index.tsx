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
import { useCreateAccount } from "@/hooks/data/useAccounts";
import { toast } from "sonner";

interface CreateAccountModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const CreateAccountSchema = z
	.object({
		email: z.string().email("Email không hợp lệ"),
		password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
		confirmPassword: z.string(),
		role: z.string().min(1, "Vui lòng chọn vai trò"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu không khớp",
		path: ["confirmPassword"],
	});

type AccountFormValues = z.infer<typeof CreateAccountSchema>;

const CreateAccountModal = ({ open, setOpen }: CreateAccountModalProps) => {
	const { mutate: createAccount, isPending } = useCreateAccount();

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(CreateAccountSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			role: "RESIDENT",
		},
	});

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	function onSubmit(values: AccountFormValues) {
		createAccount(
			{
				email: values.email,
				password: values.password,
				role: values.role as "ADMIN" | "RESIDENT" | "TECHNICIAN",
			},
			{
				onSuccess: () => {
					toast.success("Tạo tài khoản thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Lỗi tạo tài khoản");
				},
			},
		);
	}

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Tạo tài khoản mới"
			submitText="Tạo tài khoản"
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
								<FormLabel isRequired>Mật khẩu</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Nhập mật khẩu"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem className="space-y-1.5">
								<FormLabel isRequired>Xác nhận mật khẩu</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Nhập lại mật khẩu"
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
				</form>
			</Form>
		</Modal>
	);
};

export default CreateAccountModal;
