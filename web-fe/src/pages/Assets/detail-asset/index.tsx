import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { MaintenanceTimeline } from "@/components/common/MaintenanceTimeline";
import { Button } from "@/components/ui/button";
import { useGetAssetById } from "@/hooks/data/useAssests";
import DeleteAsset from "@/pages/Assets/delete-asset";
import UpdateAssetModal from "@/pages/Assets/update-asset";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
const statusMap: Record<
	string,
	{ label: string; type: "success" | "warning" | "error" | "default" }
> = {
	ACTIVE: { label: "Hoạt động", type: "success" },
	INACTIVE: { label: "Ngưng sử dụng", type: "default" },
	MAINTENANCE: { label: "Đang bảo trì", type: "warning" },
	BROKEN: { label: "Hư hỏng", type: "error" },
};
const DetailAssetPage = () => {
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const { id } = useParams();
	const { data: asset, isLoading: isAssetLoading } = useGetAssetById(
		Number(id),
	);
	const cfg = statusMap[asset?.status ?? ""] || {
		label: asset?.status ?? "Unknown",
		type: "default",
	};
	const [search, setSearch] = useState("");

	// const { data, isLoading, isError, refetch } = useGetMaintenanceTicketById(
	//   Number(id)
	// );

	// const filtered = useMemo(() => {
	//   if (!search.trim()) return data;
	//   const s = normalizeString(search);
	//   return data?.filter(
	//     (m) =>
	//       normalizeString(m.title).includes(s) ||
	//       normalizeString(m.type).includes(s) ||
	//       normalizeString(m.technicianName).includes(s)
	//   );
	// }, [data, search]);
	if (!id) {
		return (
			<div className="p-1.5 pt-0 space-y-4">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID tài sản
				</div>
			</div>
		);
	}
	// bắt buộc phải có loading, nếu không lúc mà fetch data lâu nó sẽ lỗi
	if (isAssetLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}
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
	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={asset?.name ?? "Chi tiết dịch vụ"}
					actions={headerActions}
					showBack
				/>
				<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
						<StatusBadge label={cfg.label} type={cfg.type} />
					</div>
					<div className="space-y-2">
						{/* 4 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
							<div>
								<h3 className="display-label">Loại thiết bị</h3>
								<p className="display-text">{asset?.type.name}</p>
							</div>

							<div>
								<h3 className="display-label">Tòa</h3>
								<p className="display-text">{asset?.location.blockName}</p>
							</div>

							<div>
								<h3 className="display-label">Tầng</h3>
								<p className="display-text">{asset?.location.floorDisplay}</p>
							</div>

							<div>
								<h3 className="display-label">Mô tả chi tiết</h3>
								<p className="display-text">{asset?.description}</p>
							</div>
						</div>
						<div>
							<h3 className="display-label">Ghi chú</h3>
							<p className="display-text">{asset?.note}</p>
						</div>
					</div>

					<div>
						<h2 className="title-text">Thông tin thời gian</h2>
					</div>
					<div className="space-y-2">
						{/* 4 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
							<div>
								<h3 className="display-label">Ngày lắp đặt</h3>
								<p className="display-text">
									{asset?.timeline.installationDate}
								</p>
							</div>

							<div>
								<h3 className="display-label">Chu kỳ bảo trì (tháng)</h3>
								<p className="display-text">
									{asset?.timeline.maintenanceIntervalMonths > 0
										? `${asset?.timeline.maintenanceIntervalMonths} tháng`
										: "Không có"}
								</p>
							</div>

							<div>
								<h3 className="display-label">Bảo trì gần nhất</h3>
								<p className="display-text">
									{asset?.timeline.lastMaintenanceDate || "Chưa từng bảo trì"}
								</p>
							</div>

							<div>
								<h3 className="display-label">Bảo trì tiếp theo</h3>
								<p className="display-text">
									{asset?.timeline.nextMaintenanceDate || "Chưa có"}
								</p>
							</div>
						</div>
					</div>

					<div>
						<h2 className="title-text">Lịch sử bảo trì, sửa chữa</h2>
					</div>

					<MaintenanceTimeline history={asset?.recentHistory || []} />
				</div>
			</div>
			<DeleteAsset
				seclectedAsset={asset}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateAssetModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				assetId={Number(id)}
			/>
		</>
	);
};
export default DetailAssetPage;
