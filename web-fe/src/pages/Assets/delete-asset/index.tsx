import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteAsset } from "@/hooks/data/useAssests";
import type { Asset, AssetDetail } from "@/types/asset";
import { toast } from "sonner";

interface DeleteAssetProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	seclectedAsset: Asset | undefined | AssetDetail;
}

const DeleteAsset = ({ open, setOpen, seclectedAsset }: DeleteAssetProps) => {
	const { mutate: deleteAsset } = useDeleteAsset();

	const handleDelete = () => {
		if (!seclectedAsset?.id) return;

		deleteAsset(seclectedAsset.id, {
			onSuccess: () => {
				toast.success("Tài sản đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi xóa tài sản");
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
				Bạn có chắc chắn muốn xóa tài sản{" "}
				<span className="font-semibold">"{seclectedAsset?.name}"</span> không?
			</p>
		</PopConfirm>
	);
};

export default DeleteAsset;
