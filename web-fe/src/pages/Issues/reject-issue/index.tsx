import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";

import { Modal } from "@/components/common/Modal";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { useRejectIssue } from "@/hooks/data/useIssues";
import type { IssueListItem } from "@/types/issue";

interface RejectModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	issue: IssueListItem;
	onSuccess?: () => void;
}

const RejectSchema = z.object({
	reason: z.string().min(1, "Vui lòng nhập lý do từ chối"),
});

type FormValues = z.infer<typeof RejectSchema>;

const RejectIssueModal = ({
	open,
	setOpen,
	issue,
	onSuccess,
}: RejectModalProps) => {
	const { mutate: rejectIssue, isPending } = useRejectIssue();

	const form = useForm<FormValues>({
		resolver: zodResolver(RejectSchema),
		defaultValues: {
			reason: "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({ reason: "" });
		}
	}, [open, form]);

	const onSubmit = (values: FormValues) => {
		rejectIssue(
			{ id: issue.id, reason: values.reason },
			{
				onSuccess: () => {
					toast.success("Đã từ chối phản ánh thành công");
					setOpen(false);
					onSuccess?.();
				},
				onError: (err: any) => {
					const apiMessage = err?.response?.data?.message;

					if (apiMessage) {
						toast.error(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage);
					} else {
						toast.error("Lỗi khi từ chối phản ánh");
					}
				},
			},
		);
	};

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Từ chối phản ánh"
			submitText="Xác nhận từ chối"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
			titleClassName="text-red-600"
			submitButtonClassName="bg-red-600 hover:bg-red-700 text-white"
		>
			<div className="space-y-4">
				<div className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-100">
					Phản ánh:{" "}
					<span className="font-semibold text-gray-900">{issue.title}</span>
				</div>

				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel isRequired>Lý do từ chối</FormLabel>
									<FormControl>
										<Textarea
											className="h-32 resize-none"
											placeholder="Nhập lý do từ chối..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</div>
		</Modal>
	);
};

export default RejectIssueModal;
