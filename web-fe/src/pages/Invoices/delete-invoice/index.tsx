import PopConfirm from "@/components/common/PopConfirm";
import { useDeleteInvoice } from "@/hooks/data/useInvoices";
import type { Invoice, InvoiceDetail } from "@/types/invoice";
import { toast } from "sonner";

interface DeleteInvoiceProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	seclectedInvoice: Invoice | undefined | InvoiceDetail;
}

const DeleteInvoice = ({
	open,
	setOpen,
	seclectedInvoice,
}: DeleteInvoiceProps) => {
	const { mutate: deleteInvoice } = useDeleteInvoice();

	const handleDelete = () => {
		if (!seclectedInvoice?.id) return;

		deleteInvoice(seclectedInvoice.id, {
			onSuccess: () => {
				toast.success("Hóa đơn đã được xóa thành công");
				setOpen(false);
			},
			onError: (error: any) => {
				toast.error(error.response?.data?.message || "Lỗi khi xóa hóa đơn");
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
				Bạn có chắc chắn muốn xóa hóa đơn{" "}
				<span className="font-semibold">"{seclectedInvoice?.invoiceCode}"</span>{" "}
				không?
			</p>
		</PopConfirm>
	);
};

export default DeleteInvoice;
