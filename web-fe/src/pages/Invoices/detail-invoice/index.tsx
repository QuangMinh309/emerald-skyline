import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { useGetInvoiceById } from "@/hooks/data/useInvoices";
import { InvoiceStatusMap } from "@/constants/invoiceStatus";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { formatVND } from "@/utils/money";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import DeleteInvoice from "@/pages/Invoices/delete-invoice";
import UpdateInvoiceModal from "@/pages/Invoices/update-invoice";

const DetailInvoicePage = () => {
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const { id } = useParams();
	const { data: invoice, isLoading } = useGetInvoiceById(Number(id));

	/* ========== VALIDATION ========== */
	if (!id) {
		return (
			<div className="p-1.5 pt-0">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID hóa đơn
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px]">
				<Spinner />
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="p-1.5 pt-0">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy hóa đơn
				</div>
			</div>
		);
	}

	const cfg = InvoiceStatusMap[invoice.status] ?? {
		label: "Unknown",
		type: "default",
	};
	const headerActions = (
		<div className="flex items-center gap-2">
			<Button
				className="h-9 px-3 bg-red-600 text-white border-red-200 hover:bg-red-700"
				onClick={() => setIsDeleteOpen(true)}
			>
				<Trash2 size={16} className="mr-2" /> Xóa
			</Button>
			<Button
				className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
				onClick={() => setIsUpdateOpen(true)}
			>
				<Edit size={16} className="mr-2" /> Chỉnh sửa
			</Button>
		</div>
	);
	/* ================= RENDER ================= */

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={invoice.invoiceCode ?? "Chi tiết hóa đơn"}
					showBack
					actions={headerActions}
				/>

				<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					{/* ===== Header ===== */}
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
						<StatusBadge label={cfg.label} type={cfg.type} />
					</div>

					{/* ===== Info Grid ===== */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
						<Info label="Mã hóa đơn" value={invoice.invoiceCode} />
						<Info label="ID căn hộ" value={invoice.apartmentId} />
						<Info label="Kỳ tính" value={invoice.period} />
						<Info
							label="Tổng tiền"
							value={formatVND(Number(invoice.totalAmount))}
							highlight
						/>
					</div>

					{/* ===== Details ===== */}
					<h2 className="title-text">Chi tiết hóa đơn</h2>

					{invoice.invoiceDetails.length > 0 ? (
						<div className="space-y-3">
							{invoice.invoiceDetails.map((detail) => {
								const breakdown = detail.calculationBreakdown ?? {};
								const hasBreakdown = Object.keys(breakdown).length > 0;

								return (
									<div
										key={detail.id}
										className="border border-gray-200 rounded-sm p-4 bg-gray-50"
									>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<Info label="Loại phí" value={detail.feeTypeName} />
											<Info label="Số lượng" value={detail.amount} />
											<Info
												label="Thành tiền"
												value={formatVND(Number(detail.totalPrice))}
												highlight
											/>
										</div>

										{hasBreakdown && (
											<div className="mt-3 pt-3 border-t border-gray-300">
												<h4 className="text-sm font-medium text-gray-700 mb-2">
													Chi tiết tính toán
												</h4>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
													{Object.entries(breakdown).map(([key, value]) => (
														<div key={key} className="flex gap-10">
															<span className="text-gray-600">{key}:</span>
															<span className="text-gray-800 font-medium">
																{value}
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="bg-gray-50 p-8 rounded border text-center text-gray-500">
							Không có chi tiết hóa đơn
						</div>
					)}
				</div>
			</div>
			<DeleteInvoice
				seclectedInvoice={invoice}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateInvoiceModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				invoiceId={invoice.id}
			/>
		</>
	);
};

/* ================= SMALL COMPONENT ================= */

export const Info = ({
	label,
	value,
	highlight,
}: {
	label: string;
	value: React.ReactNode;
	highlight?: boolean;
}) => (
	<div>
		<h3 className="display-label">{label}</h3>
		<p
			className={`display-text ${highlight ? "font-semibold text-green-600" : ""}`}
		>
			{value}
		</p>
	</div>
);

export default DetailInvoicePage;
