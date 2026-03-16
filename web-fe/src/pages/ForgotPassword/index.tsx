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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Mail, Shield } from "lucide-react";
import { useState } from "react";

const ForgotPasswordSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const form = useForm<ForgotPasswordValues>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	async function handleSubmit(values: ForgotPasswordValues) {
		setIsSubmitting(true);
		try {
			// TODO: Gọi API quên mật khẩu
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.success("Email khôi phục mật khẩu đã được gửi!");
			setEmailSent(true);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Có lỗi xảy ra");
		} finally {
			setIsSubmitting(false);
		}
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

					{/* Info */}
					<div className="space-y-6 mt-8">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
								<Mail className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">
									Khôi phục nhanh chóng
								</h3>
								<p className="text-white/70 text-sm">
									Nhận link khôi phục mật khẩu ngay lập tức qua email
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
								<Shield className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg mb-1">
									An toàn tuyệt đối
								</h3>
								<p className="text-white/70 text-sm">
									Link khôi phục có thời hạn và chỉ sử dụng được một lần
								</p>
							</div>
						</div>
					</div>

					{/* Quote */}
					<div className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
						<p className="text-white/90 italic">
							"Hệ thống bảo mật cao cấp đảm bảo thông tin của bạn luôn được bảo
							vệ tối đa."
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Forgot Password Form */}
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
						{!emailSent ? (
							<>
								<div className="mb-8">
									<button
										onClick={() => navigate("/login")}
										className="flex items-center gap-2 text-sm text-gray-600 hover:text-main mb-4 transition-colors"
									>
										<ArrowLeft className="w-4 h-4" />
										Quay lại đăng nhập
									</button>
									<h2 className="text-2xl font-bold text-main mb-2">
										Quên mật khẩu?
									</h2>
									<p className="text-gray-600 text-sm">
										Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi link để
										đặt lại mật khẩu.
									</p>
								</div>

								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(handleSubmit)}
										className="space-y-6"
									>
										<FormField
											disabled={isSubmitting}
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<div className="relative">
															<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
															<Input
																{...field}
																type="email"
																placeholder="example@email.com"
																className="h-11 pl-10"
															/>
														</div>
													</FormControl>
													<FormMessage className="text-xs" />
												</FormItem>
											)}
										/>

										<Button
											type="submit"
											disabled={isSubmitting}
											className="w-full h-11 bg-main hover:bg-main/90 text-white font-semibold"
										>
											{isSubmitting ? "Đang gửi..." : "Gửi link khôi phục"}
										</Button>
									</form>
								</Form>
							</>
						) : (
							<div className="text-center py-4">
								<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
									<Mail className="w-8 h-8 text-green-600" />
								</div>
								<h3 className="text-xl font-bold text-main mb-2">
									Kiểm tra email của bạn
								</h3>
								<p className="text-gray-600 text-sm mb-6">
									Chúng tôi đã gửi link khôi phục mật khẩu đến{" "}
									<span className="font-semibold text-main">
										{form.getValues("email")}
									</span>
								</p>
								<div className="space-y-3">
									<Button
										onClick={() => navigate("/login")}
										className="w-full h-11 bg-main hover:bg-main/90 text-white font-semibold"
									>
										Quay lại đăng nhập
									</Button>
									<Button
										onClick={() => setEmailSent(false)}
										variant="outline"
										className="w-full h-11"
									>
										Gửi lại email
									</Button>
								</div>
							</div>
						)}
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
