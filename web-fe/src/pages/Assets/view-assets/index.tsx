import { useState, useMemo } from "react";
import { Plus, Printer, FileDown, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { TabNavigation } from "@/components/common/TabNavigation";
import { SearchBar } from "@/components/common/SearchBar";

import { assetColumns } from "./columns";
import { assetTypeColumns } from "../view-asset-types/columns";
import type { ActionOption } from "@/types";
import { normalizeString } from "@/utils/string";
import { useAssets, useAssetTypes } from "@/hooks/data/useAssests";
import CreateAssetModal from "@/pages/Assets/create-asset";
import DeleteAsset from "@/pages/Assets/delete-asset";
import DeleteManyAssetModal from "@/pages/Assets/multiple-delete-assets";
import type { Asset, AssetType } from "@/types/asset";
import UpdateAssetModal from "@/pages/Assets/update-asset";
import CreateAssetTypeModal from "@/pages/Assets/create-asset-type";
import UpdateAssetTypeModal from "@/pages/Assets/update-asset-type";
import DeleteAssetType from "@/pages/Assets/delete-asset-type";
import { useNavigate } from "react-router-dom";
import DeleteManyAssetTypeModal from "@/pages/Assets/multiple-delete-asset-types";

const AssetsPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("assets");
	const [searchTerm, setSearchTerm] = useState("");

	// Asset states
	const [isNewModalOpen, setNewIsModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedAsset, setDeletedAsset] = useState<Asset>();
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [updatedAsset, setUpdatedAsset] = useState<number>();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyAssetOpen, setIsDeleteManyAssetOpen] = useState(false);

	// AssetType states
	const [isCreateAssetTypeModalOpen, setIsCreateAssetTypeModalOpen] =
		useState(false);
	const [isDeleteAssetTypeOpen, setIsDeleteAssetTypeOpen] = useState(false);
	const [deletedAssetType, setDeletedAssetType] = useState<AssetType>();
	const [isUpdateAssetTypeOpen, setIsUpdateAssetTypeOpen] = useState(false);
	const [updatedAssetType, setUpdatedAssetType] = useState<number>();
	const [isDeleteManyAssetTypeOpen, setIsDeleteManyAssetTypeOpen] =
		useState(false);
	// Lấy dữ liệu từ Hooks
	const {
		data: assets = [],
		isLoading: isAssetsLoading,
		isError: isAssetsError,
		error: assetsError,
		refetch: refetchAssets,
	} = useAssets();
	const {
		data: assetTypes = [],
		isLoading: isAssetTypesLoading,
		isError: isAssetTypesError,
		error: assetTypesError,
		refetch: refetchAssetTypes,
	} = useAssetTypes();

	// Logic lọc dữ liệu Assets
	const filteredAssets = useMemo(() => {
		let result = [...assets];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.name).includes(search) ||
					normalizeString(item.typeName).includes(search) ||
					normalizeString(item.blockName).includes(search) ||
					normalizeString(item.locationDetail).includes(search),
			);
		}

		return result;
	}, [assets, searchTerm]);

	// Logic lọc dữ liệu AssetTypes
	const filteredAssetTypes = useMemo(() => {
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

	// Xác định data và state dựa vào activeTab
	const isLoading =
		activeTab === "assets" ? isAssetsLoading : isAssetTypesLoading;
	const isError = activeTab === "assets" ? isAssetsError : isAssetTypesError;
	const error = activeTab === "assets" ? assetsError : assetTypesError;
	const refetch = activeTab === "assets" ? refetchAssets : refetchAssetTypes;
	const filteredData =
		activeTab === "assets" ? filteredAssets : filteredAssetTypes;
	const columns = activeTab === "assets" ? assetColumns : assetTypeColumns;
	const dataLength = activeTab === "assets" ? assets.length : assetTypes.length;

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
				disabled: dataLength === 0,
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
				disabled: dataLength === 0,
			},
		],
		[dataLength],
	);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Tài sản, thiết bị"
					subtitle="Quản lý danh sách các tài sản, thiết bị trong tòa nhà"
					actions={
						<div className="flex items-center gap-2">
							{selectedIds.length > 0 ? (
								<button
									onClick={() => {
										if (activeTab === "asset") setIsDeleteManyAssetOpen(true);
										else setIsDeleteManyAssetTypeOpen(true);
									}}
									className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium animate-in fade-in zoom-in-95 shadow-sm"
								>
									<Trash2 className="w-4 h-4" />
									Xóa ({selectedIds.length})
								</button>
							) : (
								<button
									onClick={() => {
										if (activeTab === "assets") {
											setNewIsModalOpen(true);
										} else {
											setIsCreateAssetTypeModalOpen(true);
										}
									}}
									className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
								>
									<Plus className="w-4 h-4" />
									{activeTab === "assets" ? "Tạo tài sản" : "Tạo phân loại"}
								</button>
							)}

							<ActionDropdown
								options={actions}
								sampleFileUrl={
									activeTab === "assets"
										? "/template/asset_import_template.xlsx"
										: "/template/asset_type_import_template.xlsx"
								}
							/>
						</div>
					}
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<TabNavigation
						tabs={[
							{ id: "assets", label: "Tài sản" },
							{ id: "assetType", label: "Phân loại" },
						]}
						activeTab={activeTab}
						onChange={(tab) => {
							setActiveTab(tab);
							setSearchTerm(""); // Reset search khi đổi tab
						}}
					/>

					<SearchBar
						placeholder={
							activeTab === "assets"
								? "Tìm kiếm theo tên, loại, vị trí..."
								: "Tìm kiếm theo tên, mô tả..."
						}
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							{activeTab === "assets"
								? "Đang tải dữ liệu tài sản..."
								: "Đang tải dữ liệu phân loại..."}
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
							data={filteredData as any}
							columns={columns as any}
							defaultPageSize={10}
							onSelectionChange={setSelectedIds}
							selection={activeTab === "assets" ? selectedIds : undefined}
							onEdit={(row) => {
								if (activeTab === "assets") {
									setIsUpdateOpen(true);
									setUpdatedAsset((row as Asset).id);
								} else {
									setIsUpdateAssetTypeOpen(true);
									setUpdatedAssetType((row as AssetType).id);
								}
							}}
							onDelete={(row) => {
								if (activeTab === "assets") {
									setIsDeleteOpen(true);
									setDeletedAsset(row as Asset);
								} else {
									setIsDeleteAssetTypeOpen(true);
									setDeletedAssetType(row as AssetType);
								}
							}}
							onView={(row) => navigate(`/assets/${row.id}`)}
						/>
					)}
				</div>
			</div>

			{/* Asset Modals */}
			<CreateAssetModal open={isNewModalOpen} setOpen={setNewIsModalOpen} />
			<DeleteAsset
				seclectedAsset={deletedAsset}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateAssetModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				assetId={updatedAsset!}
			/>

			{/* AssetType Modals */}
			<CreateAssetTypeModal
				open={isCreateAssetTypeModalOpen}
				setOpen={setIsCreateAssetTypeModalOpen}
			/>
			<DeleteAssetType
				selectedAssetType={deletedAssetType}
				open={isDeleteAssetTypeOpen}
				setOpen={setIsDeleteAssetTypeOpen}
			/>
			<UpdateAssetTypeModal
				open={isUpdateAssetTypeOpen}
				setOpen={setIsUpdateAssetTypeOpen}
				assetTypeId={updatedAssetType!}
			/>
			<DeleteManyAssetModal
				open={isDeleteManyAssetOpen}
				setOpen={setIsDeleteManyAssetOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
			<DeleteManyAssetTypeModal
				open={isDeleteManyAssetTypeOpen}
				setOpen={setIsDeleteManyAssetTypeOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default AssetsPage;
