import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const ResetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(1, "Vui lòng nhập mật khẩu mới")
			.min(6, "Mật khẩu tối thiểu 6 ký tự"),
		confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
	})
	.superRefine(({ newPassword, confirmPassword }, ctx) => {
		if (newPassword !== confirmPassword) {
			ctx.addIssue({
				code: "custom",
				path: ["confirmPassword"],
				message: "Mật khẩu nhập lại không khớp",
			});
		}
	});

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

type ResetPasswordFormProps = {
	onSubmit?: (values: ResetPasswordValues) => Promise<void> | void;
	defaultValues?: Partial<ResetPasswordValues>;
	isPending?: boolean;

	// Line "Chưa nhận được mã? Gửi lại"
	onResend?: () => Promise<void> | void;
	isResending?: boolean;
};

export function ResetPasswordForm({
	onSubmit,
	defaultValues,
	isPending,
	onResend,
	isResending,
}: ResetPasswordFormProps) {
	const form = useForm<ResetPasswordValues>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
			...defaultValues,
		},
	});

	const [submitting, setSubmitting] = React.useState(false);
	const loading = Boolean(isPending) || submitting;
	const resending = Boolean(isResending);

	async function handleSubmit(values: ResetPasswordValues) {
		setSubmitting(true);
		try {
			if (onSubmit) await onSubmit(values);
			else console.log("reset-password:", values);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleResend() {
		if (!onResend || loading || resending) return;
		await onResend();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col min-h-[520px] sm:min-h-[420px]"
			>
				<div className="space-y-7 sm:space-y-9">
					<FormField
						disabled={loading}
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel isRequired>Mật khẩu mới</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="password"
										placeholder=""
										autoComplete="new-password"
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
						name="confirmPassword"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel isRequired>Nhập lại mật khẩu mới</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="password"
										placeholder=""
										autoComplete="new-password"
										className="sm:h-14"
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
				</div>

				<div className="mt-auto pt-14 sm:pt-20 flex justify-center">
					<Button
						type="submit"
						className="min-w-[110px] h-12 rounded-xl text-white"
						disabled={loading}
					>
						{loading ? "Đang lưu..." : "Lưu"}
					</Button>
				</div>

				<div className="pt-6 text-center text-sm text-muted-foreground">
					<span>Chưa nhận được mã? </span>
					<button
						type="button"
						onClick={handleResend}
						disabled={!onResend || loading || resending}
						className="font-medium text-orange-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{resending ? "Đang gửi..." : "Gửi lại"}
					</button>
				</div>
			</form>
		</Form>
	);
}
