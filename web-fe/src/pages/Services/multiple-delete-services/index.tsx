"use client";

import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteManyServices } from "@/hooks/data/useServices";
import { toast } from "sonner";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedIds: string[];
	onSuccess?: () => void;
}

const DeleteManyServiceModal = ({
	open,
	setOpen,
	selectedIds,
	onSuccess,
}: Props) => {
	const { mutate: deleteMany, isPending } = useDeleteManyServices();
	const handleConfirm = () => {
		if (selectedIds.length === 0) return;

		const idsNumeric = selectedIds.map(Number);

		deleteMany(idsNumeric, {
			onSuccess: () => {
				toast.success(`Đã xóa ${selectedIds.length} dịch vụ`);
				setOpen(false);
				if (onSuccess) onSuccess();
			},
			onError: (error: any) => {
				const message = error?.response?.data?.message || "Lỗi khi xóa dữ liệu";
				toast.error(`Lỗi: ${Array.isArray(message) ? message[0] : message}`);
				setOpen(false);
			},
		});
	};

	return (
		<PopConfirm
			title="Xác nhận xóa nhiều"
			open={open}
			setOpen={setOpen}
			handleConfirm={handleConfirm}
			onLoading={isPending}
			submitText="Xóa ngay"
		>
			<div className="text-sm text-gray-600">
				Bạn có chắc chắn muốn xóa{" "}
				<span className="font-bold text-red-600 text-base">
					{selectedIds.length}
				</span>{" "}
				dịch vụ đã chọn không?
				<br />
				<span className="italic text-sm text-gray-500 mt-1 block">
					Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
				</span>
			</div>
		</PopConfirm>
	);
};

export default DeleteManyServiceModal;
