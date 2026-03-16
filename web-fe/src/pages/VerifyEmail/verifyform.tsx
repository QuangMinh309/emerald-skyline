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

const VerifySchema = z.object({
	code: z
		.string()
		.min(1, "Vui lòng nhập mã xác thực")
		.regex(/^\d{6}$/, "Mã xác thực phải gồm đúng 6 chữ số"),
});

export type VerifyValues = z.infer<typeof VerifySchema>;

type VerifyFormProps = {
	onSubmit?: (values: VerifyValues) => Promise<void> | void;
	defaultValues?: Partial<VerifyValues>;
	isPending?: boolean;

	// resend
	onResend?: () => Promise<void> | void;
	isResending?: boolean;

	loginHref?: string;
	onLoginClick?: () => void;
};

export function VerifyForm({
	onSubmit,
	defaultValues,
	isPending,
	onResend,
	isResending,
	loginHref = "/login",
	onLoginClick,
}: VerifyFormProps) {
	const form = useForm<VerifyValues>({
		resolver: zodResolver(VerifySchema),
		defaultValues: {
			code: "",
			...defaultValues,
		},
	});

	const [submitting, setSubmitting] = React.useState(false);
	const loading = Boolean(isPending) || submitting;
	const resending = Boolean(isResending);

	async function handleSubmit(values: VerifyValues) {
		setSubmitting(true);
		try {
			if (onSubmit) await onSubmit(values);
			else console.log("verify:", values);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleResend() {
		if (!onResend || resending || loading) return;
		await onResend();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col min-h-[360px] sm:min-h-[420px]"
			>
				<div className="space-y-3">
					<FormField
						disabled={loading}
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem className="space-y-1 sm:space-y-1.5">
								<FormLabel isRequired>Mã xác thực</FormLabel>
								<FormControl>
									<Input
										{...field}
										inputMode="numeric"
										className="sm:h-14"
										placeholder=""
										autoComplete="one-time-code"
										maxLength={6}
										onChange={(e) => {
											const onlyDigits = e.target.value
												.replace(/\D/g, "")
												.slice(0, 6);
											field.onChange(onlyDigits);
										}}
									/>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>

					<div className="text-right text-sm text-muted-foreground">
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
				</div>

				<div className="mt-auto pt-12 sm:pt-14 flex justify-center">
					<Button
						type="submit"
						className="min-w-[140px] rounded-lg text-white"
						disabled={loading}
					>
						{loading ? "Đang xác thực..." : "Xác thực"}
					</Button>
				</div>

				<div className="pt-6 text-center text-sm text-muted-foreground">
					<span>Đã có tài khoản? </span>
					{loginHref ? (
						<a
							href={loginHref}
							className="font-medium text-orange-500 hover:underline"
						>
							Đăng nhập
						</a>
					) : (
						<button
							type="button"
							onClick={onLoginClick}
							className="font-medium text-orange-500 hover:underline"
						>
							Đăng nhập
						</button>
					)}
				</div>
			</form>
		</Form>
	);
}
