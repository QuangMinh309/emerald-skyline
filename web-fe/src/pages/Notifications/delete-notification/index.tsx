"use client";

import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteNotification } from "@/hooks/data/useNotifications";
import type { NotificationData } from "@/types/notification";
import { toast } from "sonner";

interface DeleteNotificationProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedNotification: NotificationData | null | undefined;
	onSuccess?: () => void;
}

const DeleteNotification = ({
	open,
	setOpen,
	selectedNotification,
	onSuccess,
}: DeleteNotificationProps) => {
	const { mutate: deleteNoti, isPending } = useDeleteNotification();

	const handleDelete = () => {
		if (!selectedNotification?.id) return;

		deleteNoti(selectedNotification.id, {
			onSuccess: () => {
				toast.success("Thông báo đã được xóa thành công");
				setOpen(false);

				if (onSuccess) {
					onSuccess();
				}
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Không thể xóa thông báo");
			},
		});
	};

	return (
		<PopConfirm
			title="Xác nhận xóa"
			open={open}
			setOpen={setOpen}
			handleConfirm={handleDelete}
			onLoading={isPending}
		>
			<p>
				Bạn có chắc chắn muốn xóa thông báo{" "}
				<span className="font-semibold">"{selectedNotification?.title}"</span>{" "}
				không?
			</p>
		</PopConfirm>
	);
};

export default DeleteNotification;
