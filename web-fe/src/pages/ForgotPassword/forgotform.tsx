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

const ForgotPasswordSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

type ForgotPasswordFormProps = {
	onSubmit?: (values: ForgotPasswordValues) => Promise<void> | void;
	defaultValues?: Partial<ForgotPasswordValues>;
	isPending?: boolean;

	loginHref?: string;
	onLoginClick?: () => void;
};

export function ForgotPasswordForm({
	onSubmit,
	defaultValues,
	isPending,
	loginHref,
	onLoginClick,
}: ForgotPasswordFormProps) {
	const form = useForm<ForgotPasswordValues>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: "",
			...defaultValues,
		},
	});

	const [submitting, setSubmitting] = React.useState(false);
	const loading = Boolean(isPending) || submitting;

	async function handleSubmit(values: ForgotPasswordValues) {
		setSubmitting(true);
		try {
			if (onSubmit) await onSubmit(values);
			else console.log("forgot-password:", values);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col min-h-[280px] sm:min-h-[320px]"
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
				</div>

				<div className="mt-auto pt-10 sm:pt-12 flex justify-center">
					<Button
						type="submit"
						className="min-w-[120px] rounded-lg text-white"
						disabled={loading}
					>
						{loading ? "Đang gửi..." : "Gửi"}
					</Button>
				</div>

				<div className="pt-6 text-center text-sm text-muted-foreground">
					<span>Đăng nhập bằng tài khoản khác? </span>

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
