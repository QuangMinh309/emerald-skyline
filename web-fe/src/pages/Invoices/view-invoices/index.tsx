import { useState, useMemo } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { TabNavigation } from "@/components/common/TabNavigation";
import { SearchBar } from "@/components/common/SearchBar";

import { invoiceColumns } from "./columns";
import { clientInvoiceColumns } from "./clientInvoiceColumns";
import type { ActionOption } from "@/types";
import { normalizeString } from "@/utils/string";
import { useInvoices, useInvoicesByClient } from "@/hooks/data/useInvoices";
import type { Invoice, InvoiceDetailWithMeterReadings } from "@/types/invoice";
import { useNavigate } from "react-router-dom";
import CreateInvoiceModal from "@/pages/Invoices/create-invoice";
import DeleteInvoice from "@/pages/Invoices/delete-invoice";
import DeleteManyInvoiceModal from "@/pages/Invoices/multiple-delete-invoices";
import UpdateInvoiceModal from "@/pages/Invoices/update-invoice";
import VerifyInvoiceModal from "@/pages/Invoices/verify-invoice";
import { PrintableInvoiceList } from "./print";

const InvoicesPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("invoices");
	const [searchTerm, setSearchTerm] = useState("");

	// Invoice states
	const [isNewModalOpen, setNewIsModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedInvoice, setDeletedInvoice] = useState<Invoice>();
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [updatedInvoice, setUpdatedInvoice] = useState<number>();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);
	const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
	const [selectedClientInvoice, setSelectedClientInvoice] =
		useState<InvoiceDetailWithMeterReadings | null>(null);

	// Lấy dữ liệu từ Hooks
	const {
		data: invoices = [],
		isLoading: isInvoicesLoading,
		isError: isInvoicesError,
		error: invoicesError,
		refetch: refetchInvoices,
	} = useInvoices();

	const { data: clientInvoices = [], isLoading: isLoadingClientInvoices } =
		useInvoicesByClient();

	// Logic lọc dữ liệu Invoices
	const filteredInvoices = useMemo(() => {
		let result = [...invoices];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.invoiceCode).includes(search) ||
					normalizeString(item.apartmentId.toString()).includes(search) ||
					normalizeString(item.status).includes(search),
			);
		}

		return result;
	}, [invoices, searchTerm]);

	// Logic lọc dữ liệu Client Invoices
	const filteredClientInvoices = useMemo(() => {
		let result = [...clientInvoices];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.invoiceCode).includes(search) ||
					normalizeString(item.apartmentId.toString()).includes(search) ||
					normalizeString(item.status).includes(search),
			);
		}

		return result;
	}, [clientInvoices, searchTerm]);

	// Actions cho Dropdown
	const dataLength =
		activeTab === "invoices" ? invoices.length : clientInvoices.length;
	const actions: ActionOption[] = useMemo(
		() => [
			{
				id: "print",
				label: "In danh sách",
				icon: <Printer className="w-4 h-4" />,
				onClick: () => window.print(),
				disabled: dataLength === 0,
			},
		],
		[dataLength],
	);

	return (
		<>
			<PrintableInvoiceList data={filteredInvoices} />
			<div className="p-1.5 pt-0 space-y-4 print:hidden">
				<PageHeader
					title="Hóa đơn"
					subtitle="Quản lý danh sách các hóa đơn thanh toán"
					actions={
						<div className="flex items-center gap-2">
							{selectedIds.length > 0 ? (
								<button
									onClick={() => setIsDeleteManyOpen(true)}
									className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium animate-in fade-in zoom-in-95 shadow-sm"
								>
									<Trash2 className="w-4 h-4" />
									Xóa ({selectedIds.length})
								</button>
							) : (
								activeTab === "invoices" && (
									<button
										onClick={() => setNewIsModalOpen(true)}
										className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
									>
										<Plus className="w-4 h-4" />
										Tạo hóa đơn
									</button>
								)
							)}

							<ActionDropdown options={actions} />
						</div>
					}
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<TabNavigation
						tabs={[
							{ id: "invoices", label: "Hóa đơn của Admin" },
							{ id: "clientInvoices", label: "Hóa đơn từ cư dân" },
						]}
						activeTab={activeTab}
						onChange={(tab) => {
							setActiveTab(tab);
							setSearchTerm(""); // Reset search khi đổi tab
						}}
					/>

					<SearchBar
						placeholder={
							activeTab === "invoices"
								? "Tìm kiếm theo mã hóa đơn, mã căn hộ, trạng thái..."
								: "Tìm kiếm theo mã hóa đơn, mã căn hộ..."
						}
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{activeTab === "invoices" ? (
						// Tab Hóa đơn Admin
						<>
							{isInvoicesLoading ? (
								<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
									Đang tải dữ liệu hóa đơn...
								</div>
							) : isInvoicesError ? (
								<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
									<p className="font-medium">Không thể tải dữ liệu!</p>
									<p className="text-sm">{(invoicesError as Error)?.message}</p>
									<button
										onClick={() => refetchInvoices()}
										className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
									>
										Thử lại ngay
									</button>
								</div>
							) : (
								<CustomTable
									data={filteredInvoices}
									columns={invoiceColumns}
									defaultPageSize={10}
									onSelectionChange={setSelectedIds}
									selection={selectedIds}
									onEdit={(row) => {
										setIsUpdateOpen(true);
										setUpdatedInvoice((row as Invoice).id);
									}}
									onDelete={(row) => {
										setIsDeleteOpen(true);
										setDeletedInvoice(row as Invoice);
									}}
									onView={(row) => navigate(`/invoices/${row.id}`)}
								/>
							)}
						</>
					) : (
						// Tab Hóa đơn từ Cư dân
						<>
							{isLoadingClientInvoices ? (
								<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
									Đang tải dữ liệu hóa đơn từ cư dân...
								</div>
							) : clientInvoices.length === 0 ? (
								<div className="bg-gray-50 border border-gray-200 p-8 rounded text-center text-gray-600">
									Không có hóa đơn từ cư dân
								</div>
							) : (
								<CustomTable
									data={filteredClientInvoices}
									columns={clientInvoiceColumns}
									defaultPageSize={10}
									onView={(row) => {
										setSelectedClientInvoice(
											row as InvoiceDetailWithMeterReadings,
										);
										setIsVerifyModalOpen(true);
									}}
								/>
							)}
						</>
					)}
				</div>
			</div>

			{/* Invoice Modals */}
			<CreateInvoiceModal open={isNewModalOpen} setOpen={setNewIsModalOpen} />
			<DeleteInvoice
				seclectedInvoice={deletedInvoice}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateInvoiceModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				invoiceId={updatedInvoice!}
			/>
			<VerifyInvoiceModal
				open={isVerifyModalOpen}
				setOpen={setIsVerifyModalOpen}
				invoice={selectedClientInvoice}
			/>
			<DeleteManyInvoiceModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default InvoicesPage;
