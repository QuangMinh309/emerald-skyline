import { useState, useMemo } from "react";
import { Plus, Printer, FileDown, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";
import { TabNavigation } from "@/components/common/TabNavigation";

import { maintenanceColumns } from "./columns";
import type { ActionOption } from "@/types";
import { normalizeString } from "@/utils/string";
import { useMaintenanceTickets } from "@/hooks/data/useMaintenance";
import DeleteMaintenanceModal from "@/pages/Maintenances/delete-maintenance";
import DeleteManyMaintenanceModal from "@/pages/Maintenances/multiple-delete-maintenances";
import type { MaintenanceTicketListItem } from "@/types/maintenance";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreateIncidentMaintenanceModal from "@/pages/Maintenances/incident/create-incident-maintenance";
import UpdateIncidentMaintenanceModal from "@/pages/Maintenances/incident/update-incident-maintenance";
import CreateScheduledMaintenanceModal from "@/pages/Maintenances/scheduled/create-scheduled-maintenance";
import UpdateScheduledMaintenanceModal from "@/pages/Maintenances/scheduled/update-scheduled-maintenace";

const MaintenancesPage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("incident");
	const [searchTerm, setSearchTerm] = useState("");

	// Incident modals state
	const [isCreateIncidentModalOpen, setIsCreateIncidentModalOpen] =
		useState(false);
	const [isUpdateIncidentOpen, setIsUpdateIncidentOpen] = useState(false);
	const [updateIncidentId, setUpdateIncidentId] = useState<number>();
	// Scheduled modals state
	const [isCreateScheduledModalOpen, setIsCreateScheduledModalOpen] =
		useState(false);
	const [isUpdateScheduledOpen, setIsUpdateScheduledOpen] = useState(false);
	const [updateScheduledId, setUpdateScheduledId] = useState<number>();
	// delete
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedTicket, setDeletedTicket] =
		useState<MaintenanceTicketListItem>();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);

	// Lấy dữ liệu từ Hooks
	const {
		data: tickets = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useMaintenanceTickets();

	// Logic lọc dữ liệu theo tab và search
	const filteredTickets = useMemo(() => {
		let result = [...tickets];

		// Filter by tab (ticket type)
		if (activeTab === "incident") {
			result = result.filter((item) => item.type === "INCIDENT");
		} else if (activeTab === "maintenance") {
			result = result.filter((item) => item.type === "MAINTENANCE");
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.title).includes(search) ||
					normalizeString(item.type).includes(search) ||
					normalizeString(item.blockName || "").includes(search) ||
					normalizeString(item.technicianName || "").includes(search) ||
					normalizeString(item.assetName || "").includes(search),
			);
		}

		return result;
	}, [tickets, searchTerm, activeTab]);

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
				disabled: tickets.length === 0,
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
				disabled: tickets.length === 0,
			},
		],
		[tickets.length],
	);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Bảo trì & Sửa chữa"
					subtitle="Quản lý các yêu cầu bảo trì và sửa chữa trong chung cư"
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
								activeTab !== "incident" && (
									<Button
										onClick={() => setIsCreateScheduledModalOpen(true)}
										className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
									>
										<Plus className="w-4 h-4" />
										Tạo bảo trì định kỳ
									</Button>
								)
							)}

							<ActionDropdown
								options={actions}
								sampleFileUrl="/template/maintenance_import_template.xlsx"
							/>
						</div>
					}
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<TabNavigation
						tabs={[
							{ id: "incident", label: "Phản ánh cư dân" },
							{ id: "maintenance", label: "Bảo trì định kỳ" },
						]}
						activeTab={activeTab}
						onChange={(tab) => {
							setActiveTab(tab);
							setSearchTerm("");
						}}
					/>

					<SearchBar
						placeholder="Tìm kiếm theo tiêu đề, tòa nhà, kỹ thuật viên..."
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu yêu cầu bảo trì...
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
							data={filteredTickets}
							columns={maintenanceColumns}
							defaultPageSize={10}
							onSelectionChange={setSelectedIds}
							selection={selectedIds}
							onEdit={(row) => {
								if (row.type === "INCIDENT") {
									setIsUpdateIncidentOpen(true);
									setUpdateIncidentId(row.id);
								} else {
									setIsUpdateScheduledOpen(true);
									setUpdateScheduledId(row.id);
								}
							}}
							onDelete={(row) => {
								setIsDeleteOpen(true);
								setDeletedTicket(row as MaintenanceTicketListItem);
							}}
							onView={(row) => navigate(`/maintenances/${row.id}`)}
						/>
					)}
				</div>
			</div>
			<DeleteMaintenanceModal
				selectedTicket={deletedTicket}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<DeleteManyMaintenanceModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
			{/* Incident Modals */}
			<CreateIncidentMaintenanceModal
				open={isCreateIncidentModalOpen}
				setOpen={setIsCreateIncidentModalOpen}
			/>
			<UpdateIncidentMaintenanceModal
				open={isUpdateIncidentOpen}
				setOpen={setIsUpdateIncidentOpen}
				ticketId={updateIncidentId!}
			/>
			{/* Scheduled Modals */}
			<CreateScheduledMaintenanceModal
				open={isCreateScheduledModalOpen}
				setOpen={setIsCreateScheduledModalOpen}
			/>
			<UpdateScheduledMaintenanceModal
				open={isUpdateScheduledOpen}
				setOpen={setIsUpdateScheduledOpen}
				ticketId={updateScheduledId!}
			/>
			{/* Modals */}
			{/* <CreateMaintenanceModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
      />

      <UpdateMaintenanceModal
        open={isUpdateOpen}
        setOpen={setIsUpdateOpen}
        ticketId={selectedTicketId!}
      />
      <AssignTechnicianModal
        open={isAssignOpen}
        setOpen={setIsAssignOpen}
        ticketId={selectedTicketId!}
      />
      <CompleteMaintenanceModal
        open={isCompleteOpen}
        setOpen={setIsCompleteOpen}
        ticketId={selectedTicketId!}
      /> */}
		</>
	);
};

export default MaintenancesPage;
