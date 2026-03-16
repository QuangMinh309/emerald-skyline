import * as React from "react";
import { toast } from "sonner";
import { LogOut, Shield, User2, KeyRound } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/services/auth.service";

import PageHeader from "@components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "./components/Card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

const formatDDMMYYYY = (iso?: string) => {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
};

const ChangePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
		newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
		confirmPassword: z.string().min(1, "Vui lòng nhập xác nhận mật khẩu"),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.confirmPassword) {
			ctx.addIssue({
				code: "custom",
				path: ["confirmPassword"],
				message: "Xác nhận mật khẩu không khớp",
			});
		}
		if (
			data.oldPassword &&
			data.newPassword &&
			data.oldPassword === data.newPassword
		) {
			ctx.addIssue({
				code: "custom",
				path: ["newPassword"],
				message: "Mật khẩu mới phải khác mật khẩu hiện tại",
			});
		}
	});

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

export default function ProfilePage() {
	const { user, logout } = useAuth();
	const [changing, setChanging] = React.useState(false);
	const form = useForm<ChangePasswordValues>({
		resolver: zodResolver(ChangePasswordSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const displayEmail = React.useMemo(() => {
		if (!user) return "—";
		return user.email;
	}, []);

	const onSubmitChangePassword = async (values: ChangePasswordValues) => {
		try {
			setChanging(true);

			await changePassword({
				oldPassword: values.oldPassword,
				newPassword: values.newPassword,
			});

			toast.success("Đổi mật khẩu thành công.");
			form.reset();
		} catch (err: any) {
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Đổi mật khẩu thất bại. Vui lòng thử lại.";
			toast.error(msg);
		} finally {
			setChanging(false);
		}
	};

	const handleLogout = () => {
		logout();
		window.location.assign("/login");
	};

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader
				title="Tài khoản"
				subtitle="Thông tin tài khoản và đổi mật khẩu"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* LEFT: Thông tin tài khoản */}
				<Card className="lg:col-span-1 border-gray-200 shadow-sm rounded-sm">
					<CardHeader>
						<div className="flex items-center gap-2">
							<User2 className="h-5 w-5 text-neutral-600" />
							<CardTitle className="text-base">Thông tin tài khoản</CardTitle>
						</div>
						<CardDescription></CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<div className="space-y-2">
							<div className="display-label text-neutral-500">Email</div>
							<div className="display-text">{displayEmail}</div>
						</div>
						<div className="space-y-2">
							<div className="display-label text-neutral-500">Vai trò</div>
							<div className="display-text">{user?.role ?? "—"}</div>
						</div>

						<div className="space-y-2">
							<div className="display-label text-neutral-500">Trạng thái</div>
							<div
								className={cn(
									"font-semibold",
									user?.isActive ? "text-emerald-700" : "text-red-600",
								)}
							>
								{user?.isActive ? "Đang hoạt động" : ""}
							</div>
						</div>

						<div className="space-y-2">
							<div className="display-label text-neutral-500">Ngày tạo</div>
							<div className="display-text">
								{formatDDMMYYYY((user as any)?.createdAt)}
							</div>
						</div>

						<div className="space-y-2">
							<div className="display-label text-neutral-500">Cập nhật</div>
							<div className="display-text mb-4">
								{formatDDMMYYYY((user as any)?.updatedAt)}
							</div>
						</div>

						<Button
							type="button"
							className="h-9 bg-red-600 hover:bg-red-700 text-white"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4 mr-2" />
							Đăng xuất
						</Button>
					</CardContent>
				</Card>

				{/* RIGHT: Security */}
				<Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-sm">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-neutral-600" />
							<CardTitle className="text-base">Bảo mật</CardTitle>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* Change password */}
						<div className="rounded-lg border border-neutral-200 bg-white p-4">
							<div className="flex items-center gap-2 mb-3">
								<KeyRound className="h-4 w-4 text-neutral-600" />
								<div className="font-semibold text-neutral-800">
									Đổi mật khẩu
								</div>
							</div>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmitChangePassword)}
									className="grid grid-cols-1 md:grid-cols-2 gap-4"
								>
									<FormField
										disabled={changing}
										control={form.control}
										name="oldPassword"
										render={({ field }) => (
											<FormItem className="space-y-1.5 md:col-span-2">
												<FormLabel isRequired>Mật khẩu hiện tại</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập mật khẩu hiện tại"
														autoComplete="current-password"
														className="h-9"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>

									<FormField
										disabled={changing}
										control={form.control}
										name="newPassword"
										render={({ field }) => (
											<FormItem className="space-y-1.5">
												<FormLabel isRequired>Mật khẩu mới</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập mật khẩu mới"
														autoComplete="new-password"
														className="h-9"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>

									<FormField
										disabled={changing}
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem className="space-y-1.5">
												<FormLabel isRequired>Xác nhận mật khẩu mới</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập lại mật khẩu mới"
														autoComplete="new-password"
														className="h-9"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>

									<div className="md:col-span-2 flex items-center justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											className="h-9"
											onClick={() => form.reset()}
											disabled={changing}
										>
											Xóa nhập
										</Button>

										<Button
											type="submit"
											className="h-9 bg-[#1F4E3D] hover:bg-[#16382b]"
											disabled={changing}
										>
											{changing ? "Đang đổi..." : "Đổi mật khẩu"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
