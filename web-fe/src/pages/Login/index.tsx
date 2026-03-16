import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/data/useLogin";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Eye, EyeOff, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";

const LoginSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
	const navigate = useNavigate();
	const { mutate: loginService, isPending } = useLogin();
	const { login, isAuthenticated, user } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	// Nếu đã đăng nhập, redirect đi (không cho xem trang login)
	useEffect(() => {
		if (isAuthenticated && user && user.role !== "RESIDENT") {
			navigate("/profile", { replace: true });
		}
	}, [isAuthenticated, user, navigate]);

	const form = useForm<LoginValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function handleSubmit(values: LoginValues) {
		loginService(
			{
				email: values.email,
				password: values.password,
			},
			{
				onSuccess(data) {
					const { accessToken, ...profile } = data;

					// Kiểm tra role - chỉ ADMIN và TECHNICIAN được vào web
					if (profile.role === "RESIDENT") {
						toast.error(
							"Tài khoản này là của cư dân. Hãy sử dụng ứng dụng di động để đăng nhập.",
						);
						return;
					}

					login(accessToken, profile);
					toast.success("Đăng nhập thành công");
					navigate("/profile", { replace: true });
				},
				onError(error: any) {
					toast.error(error.response?.data?.message || "Đăng nhập thất bại");
				},
			},
		);
	}

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-main via-main/95 to-main/80 relative overflow-hidden">
				{/* Decorative circles */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-80 h-80 bg-third/30 rounded-full blur-3xl" />

				<div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
					{/* Logo/Brand */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
								<Building2 className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold">Emerald</h1>
								<p className="text-white/80 text-sm">
									Quản lý chung cư thông minh
								</p>
							</div>
						</div>
					</div>

					{/* Features */}
					<div className="space-y-6 mt-8">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
								<Users className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">Quản lý cư dân</h3>
								<p className="text-white/70 text-sm">
									Theo dõi thông tin cư dân, căn hộ và dịch vụ một cách hiệu quả
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
								<Shield className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">
									An toàn & Bảo mật
								</h3>
								<p className="text-white/70 text-sm">
									Hệ thống bảo mật cao, đảm bảo thông tin luôn được an toàn
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
								<Building2 className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">
									Quản lý toàn diện
								</h3>
								<p className="text-white/70 text-sm">
									Từ thu phí, bảo trì đến thông báo - tất cả trong một nền tảng
								</p>
							</div>
						</div>
					</div>

					{/* Quote */}
					<div className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
						<p className="text-white/90 italic">
							"Giải pháp quản lý chung cư hiện đại, giúp tối ưu hóa công việc và
							nâng cao trải nghiệm cư dân."
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="flex-1 flex items-center justify-center px-6 py-12 bg-third/30">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center justify-center gap-3 mb-8">
						<div className="w-12 h-12 rounded-xl bg-main flex items-center justify-center">
							<Building2 className="w-7 h-7 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-main">Emerald</h1>
							<p className="text-gray-600 text-sm">Quản lý chung cư</p>
						</div>
					</div>

					{/* Form Card */}
					<div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
						<div className="mb-8">
							<h2 className="text-2xl font-bold text-main mb-2">Đăng nhập</h2>
							<p className="text-gray-600 text-sm">
								Chào mừng bạn quay trở lại!
							</p>
						</div>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-5"
							>
								<FormField
									disabled={isPending}
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="email"
													placeholder="example@email.com"
													className="h-11"
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<FormField
									disabled={isPending}
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mật khẩu</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														className="h-11 pr-10"
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
													>
														{showPassword ? (
															<EyeOff className="h-5 w-5" />
														) : (
															<Eye className="h-5 w-5" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											id="remember"
											className="w-4 h-4 rounded border-gray-300 text-main focus:ring-main"
										/>
										<label htmlFor="remember" className="text-sm text-gray-700">
											Ghi nhớ đăng nhập
										</label>
									</div>
									<a
										href="/forgot-password"
										className="text-sm font-medium text-secondary hover:underline"
									>
										Quên mật khẩu?
									</a>
								</div>

								<Button
									type="submit"
									disabled={isPending}
									className="w-full h-11 bg-main hover:bg-main/90 text-white font-semibold"
								>
									{isPending ? "Đang đăng nhập..." : "Đăng nhập"}
								</Button>
							</form>
						</Form>

						{/* Footer */}
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Dành cho quản lý và nhân viên tòa nhà
							</p>
						</div>
					</div>

					{/* Bottom text */}
					<p className="mt-6 text-center text-sm text-gray-500">
						© 2026 Emerald. Bảo mật & An toàn
					</p>
				</div>
			</div>
		</div>
	);
}
