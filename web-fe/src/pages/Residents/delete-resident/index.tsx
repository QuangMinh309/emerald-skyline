import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteResident } from "@/hooks/data/useResidents";
import type { Resident } from "@/types/resident";
import { toast } from "sonner";

interface DeleteResidentProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedResident: Resident | undefined;
}

const DeleteResident = ({
	open,
	setOpen,
	selectedResident,
}: DeleteResidentProps) => {
	const { mutate: deleteResident } = useDeleteResident();

	const handleDelete = () => {
		if (!selectedResident?.id) return;

		deleteResident(selectedResident.id, {
			onSuccess: () => {
				toast.success("Cư dân đã được xóa thành công");
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi xóa cư dân");
			},
			onSettled: () => {
				setOpen(false);
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
				Bạn có chắc chắn muốn xóa cư dân{" "}
				<span className="font-semibold">"{selectedResident?.fullName}"</span>{" "}
				không?
			</p>
		</PopConfirm>
	);
};

export default DeleteResident;
