"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteManyAccounts } from "@/hooks/data/useAccounts";
import { toast } from "sonner";

interface MultipleDeleteAccountsModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	accountIds: string[];
	onSuccess?: () => void;
}

const MultipleDeleteAccountsModal = ({
	open,
	setOpen,
	accountIds = [],
	onSuccess,
}: MultipleDeleteAccountsModalProps) => {
	const { mutate: deleteMany, isPending } = useDeleteManyAccounts();

	const handleDelete = () => {
		if (!accountIds || accountIds.length === 0) return;
		const idsNumeric = accountIds.map(Number);
		deleteMany(idsNumeric, {
			onSuccess: () => {
				toast.success(`Đã xóa ${accountIds.length} tài khoản thành công`);
				setOpen(false);
				onSuccess?.();
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi xóa tài khoản");
			},
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Xác nhận xóa nhiều tài khoản</AlertDialogTitle>
					<AlertDialogDescription>
						Bạn có chắc chắn muốn xóa{" "}
						<span className="font-semibold">{accountIds?.length || 0}</span> tài
						khoản đã chọn?
						<br />
						Hành động này có thể được hoàn tác sau.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isPending}
						className="bg-destructive hover:bg-destructive/90"
					>
						{isPending
							? "Đang xóa..."
							: `Xóa ${accountIds?.length || 0} tài khoản`}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default MultipleDeleteAccountsModal;
