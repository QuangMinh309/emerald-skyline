import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteTechnician } from "@/hooks/data/useTechnicians";
import type { Technician } from "@/types/technician";
import { toast } from "sonner";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	technician: Technician | undefined;
}

const DeleteTechnicianModal = ({ open, setOpen, technician }: ModalProps) => {
	const { mutate: deleteTechnician } = useDeleteTechnician();

	const handleDelete = () => {
		if (!technician) return;

		deleteTechnician(technician.id, {
			onSuccess: () => {
				toast.success("Kỹ thuật viên đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(
					error.response?.data?.message || "Lỗi khi xóa kỹ thuật viên",
				);
			},
		});
	};

	return (
		<PopConfirm
			open={open}
			setOpen={setOpen}
			title="Xác nhận xóa kỹ thuật viên"
			handleConfirm={handleDelete}
		>
			<p>
				Bạn có chắc chắn muốn xóa kỹ thuật viên{" "}
				<span className="font-semibold">"{technician?.fullName}"</span> không?
			</p>
		</PopConfirm>
	);
};

export default DeleteTechnicianModal;
