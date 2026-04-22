import { useMemo, useState } from "react";
import { Plus, Printer, FileDown, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";

import { normalizeString } from "@/utils/string";
import type { ActionOption } from "@/types";

import type { Service } from "@/types/service";
import { serviceColumns } from "./columns";

import { useServices } from "@/hooks/data/useServices";
import DeleteService from "./delete-service";
import CreateServiceModal from "./create-service";
import UpdateServiceModal from "./update-service";
import DeleteManyServiceModal from "./multiple-delete-services";

const ServicesPage = () => {
	const navigate = useNavigate();

	const [searchTerm, setSearchTerm] = useState("");
	const [isNewModalOpen, setNewIsModalOpen] = useState(false);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [selectedService, setSelectedService] = useState<Service | undefined>(
		undefined,
	);

	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const {
		data: services = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useServices();
	// Filter theo search (bạn có thể thêm lọc theo tab/status sau)
	const filteredData = useMemo(() => {
		let result = [...services];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter((item) => {
				return (
					normalizeString(item.name).includes(search) ||
					normalizeString(item.id ?? "").includes(search)
				);
			});
		}

		return result;
	}, [services, searchTerm]);

	// const actions: ActionOption[] = useMemo(
	//   () => [
	//     // {
	//     //   id: "delete_more",
	//     //   label: "Xóa tất cả",
	//     //   icon: <Trash2 className="w-4 h-4" />,
	//     //   variant: "danger",
	//     //   onClick: () => console.log("Xóa nhiều"),
	//     //   disabled: services.length === 0,
	//     // },
	//     {
	//       id: "import",
	//       label: "Import Excel",
	//       icon: <FileDown className="w-4 h-4" />,
	//       onClick: () => console.log("Importing..."),
	//     },
	//     {
	//       id: "print",
	//       label: "In danh sách",
	//       icon: <Printer className="w-4 h-4" />,
	//       onClick: () => window.print(),
	//       disabled: services.length === 0,
	//     },
	//   ],
	//   [services.length],
	// );

	const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Danh sách dịch vụ"
					subtitle="Quản lý danh sách các dịch vụ của chung cư"
					actions={
						<div className="flex items-center gap-2">
							{selectedIds.length > 0 ? (
								<button
									className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium animate-in fade-in zoom-in-95 shadow-sm"
									onClick={() => setIsDeleteManyOpen(true)}
								>
									<Trash2 className="w-4 h-4" />
									Xóa ({selectedIds.length})
								</button>
							) : (
								<button
									type="button"
									onClick={() => setNewIsModalOpen(true)}
									className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
								>
									<Plus className="w-4 h-4" /> Thêm dịch vụ
								</button>
							)}
							{/* <ActionDropdown
                options={actions}
                sampleFileUrl="/template/service_import_template.xlsx"
              /> */}
						</div>
					}
				/>

				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<SearchBar
						placeholder="Tìm kiếm theo tên dịch vụ, mã dịch vụ..."
						onSearch={setSearchTerm}
					/>
				</div>

				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu dịch vụ...
						</div>
					) : isError ? (
						<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
							<p className="font-medium">Không thể tải dữ liệu!</p>
							<p className="text-sm">{(error as Error)?.message}</p>
							<button
								type="button"
								onClick={() => refetch()}
								className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
							>
								Thử lại ngay
							</button>
						</div>
					) : (
						<CustomTable
							data={filteredData}
							columns={serviceColumns}
							defaultPageSize={10}
							onSelectionChange={handleSelectionChange}
							selection={selectedIds}
							onEdit={(row) => {
								setServiceToEdit(row);
								setIsUpdateOpen(true);
							}}
							onDelete={(row) => {
								setIsDeleteOpen(true);
								setSelectedService(row);
							}}
							onView={(row) =>
								navigate(`/services/${row.id}`, {
									state: { service: row },
								})
							}
						/>
					)}
				</div>
			</div>

			<CreateServiceModal open={isNewModalOpen} setOpen={setNewIsModalOpen} />
			<DeleteService
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
				selectedService={selectedService}
			/>
			<UpdateServiceModal
				open={isUpdateOpen}
				setOpen={(open) => {
					setIsUpdateOpen(open);
					if (!open) setServiceToEdit(null);
				}}
				serviceId={serviceToEdit?.id}
				// nếu modal hỗ trợ callback:
				// onUpdated={() => { setIsUpdateOpen(false); setServiceToEdit(null); refetch(); }}
			/>
			<DeleteManyServiceModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default ServicesPage;
