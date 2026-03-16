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
import { useDeleteAccount } from "@/hooks/data/useAccounts";
import type { Account } from "@/types/account";
import { toast } from "sonner";

interface DeleteAccountModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	account?: Account | null;
}

const DeleteAccountModal = ({
	open,
	setOpen,
	account,
}: DeleteAccountModalProps) => {
	const { mutate: deleteAccount, isPending } = useDeleteAccount();

	const handleDelete = () => {
		if (!account?.id) return;

		deleteAccount(account.id, {
			onSuccess: () => {
				toast.success("Xóa tài khoản thành công");
				setOpen(false);
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
					<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
					<AlertDialogDescription>
						Bạn có chắc chắn muốn xóa tài khoản{" "}
						<span className="font-semibold">{account?.email}</span>?
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
						{isPending ? "Đang xóa..." : "Xóa"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteAccountModal;
