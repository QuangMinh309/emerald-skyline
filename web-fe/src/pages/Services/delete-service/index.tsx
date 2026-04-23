import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteService } from "@/hooks/data/useServices";
import type { Service } from "@/types/service";
import { toast } from "sonner";

interface DeleteServiceProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	selectedService: Service | undefined;
	onDeleted?: () => void;
}

const DeleteService = ({
	open,
	setOpen,
	selectedService,
	onDeleted,
}: DeleteServiceProps) => {
	const { mutate: deleteService } = useDeleteService();

	const handleDelete = () => {
		deleteService(selectedService ? selectedService.id : 0, {
			onSuccess: () => {
				toast.success("Dịch vụ đã được xóa thành công");
				setOpen(false);
				onDeleted?.();
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi xóa dịch vụ");
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
			<p>{`Bạn có chắc chắn muốn xóa dịch vụ "${selectedService?.name}" không?`}</p>
		</PopConfirm>
	);
};

export default DeleteService;
