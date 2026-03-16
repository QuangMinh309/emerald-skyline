import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteAssetType } from "@/hooks/data/useAssests";
import type { AssetType } from "@/types/asset";
import { toast } from "sonner";

interface DeleteAssetTypeProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedAssetType: AssetType | undefined;
}

const DeleteAssetType = ({
	open,
	setOpen,
	selectedAssetType,
}: DeleteAssetTypeProps) => {
	const { mutate: deleteAssetType } = useDeleteAssetType();

	const handleDelete = () => {
		if (!selectedAssetType?.id) return;

		deleteAssetType(selectedAssetType.id, {
			onSuccess: () => {
				toast.success("Loại tài sản đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(
					error.response?.data?.message || "Lỗi khi xóa loại tài sản",
				);
			},
		});
	};

	return (
		<PopConfirm
			title="Xác nhận xóa"
			open={open}
			setOpen={setOpen}
			handleConfirm={handleDelete}
		>
			<p>
				Bạn có chắc chắn muốn xóa loại tài sản{" "}
				<span>"{selectedAssetType?.name}"</span> không?
			</p>
		</PopConfirm>
	);
};

export default DeleteAssetType;
