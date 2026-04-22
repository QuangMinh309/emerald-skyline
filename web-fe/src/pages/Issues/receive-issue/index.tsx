import PopConfirm from "@/components/common/PopConfirm";
import { useUpdateIssue } from "@/hooks/data/useIssues";
import type { IssueListItem } from "@/types/issue";
import { toast } from "sonner";

interface ReceiveIssueModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	issue: IssueListItem;
	onSuccess?: () => void;
}

const ReceiveIssueModal = ({
	open,
	setOpen,
	issue,
	onSuccess,
}: ReceiveIssueModalProps) => {
	const { mutate: updateIssue, isPending } = useUpdateIssue();

	const handleConfirm = () => {
		updateIssue(
			{ id: issue.id, data: { status: "RECEIVED" } },
			{
				onSuccess: () => {
					toast.success("Đã tiếp nhận phản ánh thành công!");
					setOpen(false);
					onSuccess?.();
				},
				onError: (err: any) => {
					toast.error(err?.message || "Lỗi khi tiếp nhận phản ánh");
				},
			},
		);
	};

	return (
		<PopConfirm
			open={open}
			setOpen={setOpen}
			title="Xác nhận tiếp nhận"
			handleConfirm={handleConfirm}
			onLoading={isPending}
			submitText="Tiếp nhận ngay"
			titleClassName="text-[#244B35]"
			buttonClassName="bg-[#244B35] hover:bg-[#16382b] text-white"
		>
			<div className="text-sm text-gray-600">
				Bạn có chắc chắn muốn tiếp nhận phản ánh:
				<br />
				<span className="font-semibold text-gray-900 block mt-1">
					"{issue.title}"
				</span>
				<br />
				Hệ thống sẽ chuyển trạng thái sang <strong>Đã tiếp nhận</strong>.
			</div>
		</PopConfirm>
	);
};

export default ReceiveIssueModal;
