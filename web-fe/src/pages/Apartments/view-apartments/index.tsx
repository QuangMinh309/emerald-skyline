import { useState, useMemo } from "react";
import { Plus, Printer, FileDown, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";

import { apartmentColumns } from "./columns";
import type { ActionOption } from "@/types";
import { normalizeString } from "@/utils/string";
import { useApartments } from "@/hooks/data/useApartments";
import CreateApartmentModal from "@/pages/Apartments/create-apartment";
import DeleteApartment from "@/pages/Apartments/delete-apartment";
import DeleteManyApartmentModal from "@/pages/Apartments/multiple-delete-apartments";
import type { Apartment } from "@/types/apartment";
import UpdateApartmentModal from "@/pages/Apartments/update-apartment";
import { useNavigate } from "react-router-dom";

const ApartmentsPage = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	// Apartment states
	const [isNewModalOpen, setNewIsModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedApartment, setDeletedApartment] = useState<Apartment>();
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [updatedApartment, setUpdatedApartment] = useState<number>();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);

	// Lấy dữ liệu từ Hooks
	const {
		data: apartments = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useApartments();

	// Logic lọc dữ liệu Apartments
	const filteredApartments = useMemo(() => {
		let result = [...apartments];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.roomName).includes(search) ||
					normalizeString(item.type).includes(search) ||
					normalizeString(item.block).includes(search) ||
					normalizeString(item.owner).includes(search),
			);
		}

		return result;
	}, [apartments, searchTerm]);

	// Actions cho Dropdown
	const actions: ActionOption[] = useMemo(
		() => [
			{
				id: "delete_all",
				label: "Xóa tất cả",
				icon: <Trash2 className="w-4 h-4" />,
				variant: "danger",
				onClick: () =>
					confirm("Xóa toàn bộ dữ liệu?") && console.log("Delete All"),
				disabled: apartments.length === 0,
			},
			{
				id: "import",
				label: "Import Excel",
				icon: <FileDown className="w-4 h-4" />,
				onClick: () => console.log("Importing..."),
			},
			{
				id: "print",
				label: "In danh sách",
				icon: <Printer className="w-4 h-4" />,
				onClick: () => window.print(),
				disabled: apartments.length === 0,
			},
		],
		[apartments.length],
	);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Căn hộ"
					subtitle="Quản lý danh sách các căn hộ trong chung cư"
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
								<button
									onClick={() => setNewIsModalOpen(true)}
									className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
								>
									<Plus className="w-4 h-4" />
									Tạo căn hộ
								</button>
							)}

							<ActionDropdown
								options={actions}
								sampleFileUrl="/template/apartment_import_template.xlsx"
							/>
						</div>
					}
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<SearchBar
						placeholder="Tìm kiếm theo mã căn hộ, loại, tòa nhà, chủ hộ..."
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu căn hộ...
						</div>
					) : isError ? (
						<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
							<p className="font-medium">Không thể tải dữ liệu!</p>
							<p className="text-sm">{(error as Error)?.message}</p>
							<button
								onClick={() => refetch()}
								className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
							>
								Thử lại ngay
							</button>
						</div>
					) : (
						<CustomTable
							data={filteredApartments}
							columns={apartmentColumns}
							defaultPageSize={10}
							onSelectionChange={setSelectedIds}
							selection={selectedIds}
							onEdit={(row) => {
								setIsUpdateOpen(true);
								setUpdatedApartment((row as Apartment).id);
							}}
							onDelete={(row) => {
								setIsDeleteOpen(true);
								setDeletedApartment(row as Apartment);
							}}
							onView={(row) => navigate(`/apartments/${row.id}`)}
						/>
					)}
				</div>
			</div>

			{/* Apartment Modals */}
			<CreateApartmentModal open={isNewModalOpen} setOpen={setNewIsModalOpen} />
			<DeleteApartment
				selectedApartment={deletedApartment}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateApartmentModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				apartmentId={updatedApartment!}
			/>
			<DeleteManyApartmentModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default ApartmentsPage;
