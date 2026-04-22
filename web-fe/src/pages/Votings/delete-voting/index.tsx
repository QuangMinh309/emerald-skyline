"use client";

import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteVoting } from "@/hooks/data/useVotings";
import type { VotingData } from "@/types/voting";
import { toast } from "sonner";

interface DeleteVotingModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedItem: VotingData | null | undefined;
	onSuccess?: () => void;
}

const DeleteVotingModal = ({
	open,
	setOpen,
	selectedItem,
	onSuccess,
}: DeleteVotingModalProps) => {
	const { mutate: deleteVoting, isPending } = useDeleteVoting();

	const handleDelete = () => {
		if (!selectedItem?.id) return;

		deleteVoting(selectedItem.id, {
			onSuccess: () => {
				toast.success("Biểu quyết đã được xóa thành công");
				setOpen(false);

				if (onSuccess) {
					onSuccess();
				}
			},
			onError: (error: any) => {
				const message =
					error?.response?.data?.message || "Không thể xóa biểu quyết";
				toast.error(`Lỗi: ${Array.isArray(message) ? message[0] : message}`);
			},
		});
	};

	return (
		<PopConfirm
			title="Xác nhận xóa biểu quyết"
			open={open}
			setOpen={setOpen}
			handleConfirm={handleDelete}
			onLoading={isPending}
		>
			<div className="space-y-2">
				<p>
					Bạn có chắc chắn muốn xóa cuộc biểu quyết{" "}
					<span className="font-semibold">"{selectedItem?.title}"</span> không?
				</p>
			</div>
		</PopConfirm>
	);
};

export default DeleteVotingModal;
