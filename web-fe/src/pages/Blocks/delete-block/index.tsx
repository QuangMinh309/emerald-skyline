import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteBlock } from "@/hooks/data/useBlocks";

import type { Block, BlockDetail } from "@/types/block";
import { toast } from "sonner";

interface DeleteBlockProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	seclectedBlock: BlockDetail | undefined | Block;
}

const DeleteBlock = ({ open, setOpen, seclectedBlock }: DeleteBlockProps) => {
	const { mutate: deleteBlock } = useDeleteBlock();

	const handleDelete = () => {
		if (!seclectedBlock?.id) return;

		deleteBlock(seclectedBlock.id, {
			onSuccess: () => {
				toast.success("Khối nhà đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi xóa khối nhà");
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
				Bạn có chắc chắn muốn xóa khối nhà{" "}
				<span className="font-semibold">"{seclectedBlock?.buildingName}"</span>{" "}
				không?
			</p>
		</PopConfirm>
	);
};

export default DeleteBlock;
