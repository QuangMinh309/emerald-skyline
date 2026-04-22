"use client";

import { useState, useMemo } from "react";
import { Plus, Printer, FileDown, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import ActionDropdown from "@/components/common/ActionDropdown";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";
import { TabNavigation } from "@/components/common/TabNavigation";

import DeleteVotingModal from "@/pages/Votings/delete-voting";
import DeleteManyVotingModal from "@/pages/Votings/multiple-delete-votings";

import { useVotings } from "@/hooks/data/useVotings";
import { votingColumns } from "./columns";
import { normalizeString } from "@/utils/string";
import type { VotingData } from "@/types/voting";
import type { ActionOption, TabItem } from "@/types";

const VotingsPage = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("ALL");

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletingItem, setDeletingItem] = useState<VotingData | null>(null);

	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const { data: votings = [], isLoading, isError, refetch } = useVotings();

	const safeVotings = useMemo(() => {
		return Array.isArray(votings) ? votings : [];
	}, [votings]);

	const filteredData = useMemo(() => {
		let result = [...safeVotings];
		if (activeTab !== "ALL") {
			result = result.filter((item) => item.status === activeTab);
		}
		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter((item) =>
				normalizeString(item.title).includes(search),
			);
		}
		return result;
	}, [safeVotings, searchTerm, activeTab]);

	const tabs: TabItem[] = useMemo(() => {
		const getCount = (status: string) =>
			safeVotings.filter((v) => v.status === status).length;
		return [
			{ id: "ALL", label: "Tất cả", count: safeVotings.length },
			{ id: "UPCOMING", label: "Sắp diễn ra", count: getCount("UPCOMING") },
			{ id: "ONGOING", label: "Đang diễn ra", count: getCount("ONGOING") },
			{ id: "ENDED", label: "Đã kết thúc", count: getCount("ENDED") },
		];
	}, [safeVotings]);

	const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

	const handleEdit = (item: VotingData) => {
		if (item.status !== "UPCOMING") {
			toast.error(
				"Không thể chỉnh sửa cuộc biểu quyết đã diễn ra hoặc kết thúc!",
			);
			return;
		}
		navigate(`update/${item.id}`);
	};

	const handleDelete = (item: VotingData) => {
		if (item.status !== "UPCOMING") {
			toast.error("Không thể xóa cuộc biểu quyết đã diễn ra hoặc kết thúc!");
			return;
		}
		setDeletingItem(item);
		setIsDeleteOpen(true);
	};

	const handleView = (item: VotingData) => {
		navigate(`${item.id}`);
	};

	const handleBulkDeleteClick = () => {
		const selectedItems = safeVotings.filter((v) =>
			selectedIds.some((id) => String(id) === String(v.id)),
		);

		const hasInvalidStatus = selectedItems.some((v) => v.status !== "UPCOMING");

		if (hasInvalidStatus) {
			toast.error(
				"Chỉ được xóa các cuộc biểu quyết ở trạng thái 'Sắp diễn ra'!",
			);
			return;
		}

		setIsDeleteManyOpen(true);
	};

	const actions: ActionOption[] = useMemo(
		() => [
			{
				id: "print",
				label: "In danh sách",
				icon: <Printer className="w-4 h-4" />,
				onClick: () => window.print(),
				disabled: safeVotings.length === 0,
			},
			{
				id: "export",
				label: "Xuất Excel",
				icon: <FileDown className="w-4 h-4" />,
				onClick: () => console.log("Exporting..."),
			},
		],
		[safeVotings.length],
	);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Biểu quyết"
					subtitle="Quản lý các cuộc biểu quyết và kết quả biểu quyết từ cư dân"
					actions={
						<div className="flex items-center gap-2">
							{selectedIds.length > 0 ? (
								<button
									onClick={handleBulkDeleteClick}
									className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium animate-in fade-in zoom-in-95 shadow-sm"
								>
									<Trash2 className="w-4 h-4" />
									Xóa ({selectedIds.length})
								</button>
							) : (
								<button
									onClick={() => navigate("create")}
									className="flex items-center gap-2 bg-[#244B35] text-white px-4 py-2 rounded-lg hover:bg-[#1e3f2d] transition-colors text-sm font-medium shadow-sm"
								>
									<Plus className="w-4 h-4" />
									Tạo biểu quyết
								</button>
							)}
							<ActionDropdown options={actions} />
						</div>
					}
				/>

				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<TabNavigation
						tabs={tabs}
						activeTab={activeTab}
						onChange={(tabId) => {
							setActiveTab(tabId);
							setSearchTerm("");
							setSelectedIds([]);
						}}
					/>
					<SearchBar
						placeholder="Tìm kiếm theo tiêu đề..."
						onSearch={setSearchTerm}
					/>
				</div>

				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu biểu quyết...
						</div>
					) : isError ? (
						<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
							<p className="font-medium">Không thể tải dữ liệu!</p>
							<button
								onClick={() => refetch()}
								className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
							>
								Thử lại ngay
							</button>
						</div>
					) : (
						<CustomTable
							data={filteredData}
							columns={votingColumns}
							defaultPageSize={10}
							onSelectionChange={handleSelectionChange}
							selection={selectedIds}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onView={handleView}
							isEditable={(item) => item.status === "UPCOMING"}
						/>
					)}
				</div>
			</div>

			<DeleteVotingModal
				open={isDeleteOpen}
				setOpen={(val) => {
					setIsDeleteOpen(val);
					if (!val) setDeletingItem(null);
				}}
				selectedItem={deletingItem}
			/>

			<DeleteManyVotingModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				selectedIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default VotingsPage;
