import { useState, useMemo } from "react";
import { Printer, FileDown, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";
import { assetTypeColumns } from "./columns";
import type { ActionOption } from "@/types";
import { normalizeString } from "@/utils/string";
import { useAssetTypes } from "@/hooks/data/useAssests";
import CreateAssetTypeModal from "@/pages/Assets/create-asset-type";
import DeleteAssetType from "@/pages/Assets/delete-asset-type";
import type { AssetType } from "@/types/asset";
import UpdateAssetTypeModal from "@/pages/Assets/update-asset-type";
import DeleteManyAssetTypeModal from "@/pages/Assets/multiple-delete-asset-types";

const AssetTypesPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedAssetType, setDeletedAssetType] = useState<AssetType>();
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [updatedAssetType, setUpdatedAssetType] = useState<number>();
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);

	// Lấy dữ liệu từ Hook
	const {
		data: assetTypes = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useAssetTypes();

	// Logic lọc dữ liệu theo search
	const filteredData = useMemo(() => {
		let result = [...assetTypes];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.name).includes(search) ||
					normalizeString(item.description || "").includes(search),
			);
		}

		return result;
	}, [assetTypes, searchTerm]);

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
				disabled: assetTypes.length === 0,
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
				disabled: assetTypes.length === 0,
			},
		],
		[assetTypes.length],
	);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Phân loại tài sản"
					subtitle="Quản lý danh mục phân loại tài sản, thiết bị"
					actions={
						<div className="flex items-center gap-2">
							{/* {selectedIds.length  0 ? (
                <button
                  onClick={() => setIsDeleteManyOpen(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.length})
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Tạo phân loại
                </button>
              )} */}

							<ActionDropdown
								options={actions}
								sampleFileUrl="/template/asset_type_import_template.xlsx"
							/>
						</div>
					}
				/>

				{/* Khu vực tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
					<SearchBar
						placeholder="Tìm kiếm theo tên, mô tả..."
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu phân loại tài sản...
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
							data={filteredData}
							columns={assetTypeColumns}
							defaultPageSize={10}
							onSelectionChange={setSelectedIds}
							selection={selectedIds}
							onEdit={(row) => {
								console.log("Sửa", row);
								setIsUpdateOpen(true);
								setUpdatedAssetType(row.id);
							}}
							onDelete={(row) => {
								setIsDeleteOpen(true);
								setDeletedAssetType(row);
							}}
						/>
					)}
				</div>
			</div>

			<CreateAssetTypeModal
				open={isCreateModalOpen}
				setOpen={setIsCreateModalOpen}
			/>
			<DeleteAssetType
				selectedAssetType={deletedAssetType}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateAssetTypeModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				assetTypeId={updatedAssetType!}
			/>
			<DeleteManyAssetTypeModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default AssetTypesPage;
