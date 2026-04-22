import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteMaintenanceTicket } from "@/hooks/data/useMaintenance";
import type { MaintenanceTicketListItem } from "@/types/maintenance";
import { toast } from "sonner";

interface DeleteMaintenanceProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedTicket: MaintenanceTicketListItem | undefined;
}

const DeleteMaintenanceModal = ({
	open,
	setOpen,
	selectedTicket,
}: DeleteMaintenanceProps) => {
	const { mutate: deleteTicket } = useDeleteMaintenanceTicket();

	const handleDelete = () => {
		if (!selectedTicket?.id) return;

		deleteTicket(selectedTicket.id, {
			onSuccess: () => {
				toast.success("Yêu cầu bảo trì đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(
					error.response?.data?.message || "Lỗi khi xóa yêu cầu bảo trì",
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
				Bạn có chắc chắn muốn xóa yêu cầu{" "}
				<span className="font-semibold">"{selectedTicket?.title}"</span> không?
			</p>
		</PopConfirm>
	);
};

export default DeleteMaintenanceModal;
