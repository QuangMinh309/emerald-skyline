import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

const LoginSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginValues = z.infer<typeof LoginSchema>;

type LoginFormProps = {
	onSubmit?: (values: LoginValues) => Promise<void> | void;
	defaultValues?: Partial<LoginValues>;
	isPending?: boolean;

	forgotHref?: string;
};

export function LoginForm({
	onSubmit,
	defaultValues,
	isPending,
	forgotHref,
}: LoginFormProps) {
	const form = useForm<LoginValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
			...defaultValues,
		},
	});

	const [submitting, setSubmitting] = React.useState(false);
	const loading = Boolean(isPending) || submitting;

	const [showPassword, setShowPassword] = React.useState(false);

	async function handleSubmit(values: LoginValues) {
		setSubmitting(true);
		try {
			if (onSubmit) await onSubmit(values);
			else console.log("login:", values);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col min-h-[360px] sm:min-h-[420px] lg:min-h-[420px]"
			>
				<div className="space-y-5 sm:space-y-6">
					<FormField
						disabled={loading}
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-1 sm:space-y-1.5">
								<FormLabel isRequired>Email</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="email"
										placeholder=""
										autoComplete="email"
										className="sm:h-14"
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<FormField
						disabled={loading}
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-1 sm:space-y-1.5">
								<FormLabel isRequired>Password</FormLabel>

								<FormControl>
									<div className="relative">
										<Input
											{...field}
											type={showPassword ? "text" : "password"}
											placeholder=""
											autoComplete="current-password"
											className="sm:h-14 pr-12"
										/>

										<button
											type="button"
											onClick={() => setShowPassword((v) => !v)}
											disabled={loading}
											aria-label={
												showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
											}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
										>
											{showPassword ? (
												<Eye className="h-5 w-5" />
											) : (
												<EyeOff className="h-5 w-5" />
											)}
										</button>
									</div>
								</FormControl>

								<div className="text-right">
									<a
										href={forgotHref}
										className="text-sm font-medium text-orange-500 hover:underline"
									>
										Quên mật khẩu
									</a>
								</div>

								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
				</div>

				<div className="mt-auto pt-8 sm:pt-10 lg:pt-12 pb-2 sm:pb-4">
					<Button
						type="submit"
						className="w-full rounded-lg text-white"
						disabled={loading}
					>
						{loading ? "Đang đăng nhập..." : "Đăng nhập"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
