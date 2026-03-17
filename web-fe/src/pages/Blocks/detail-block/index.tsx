import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { BlockStatusMap } from "@/constants/blockStatus";
import { useGetBlockById } from "@/hooks/data/useBlocks";
import DeleteBlock from "@/pages/Blocks/delete-block";
import { DetailApartmentMatrix } from "@/pages/Blocks/detail-block/DetailApartmentMatrix";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetailBlockPage = () => {
	const router = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const { data: blockData, isLoading } = useGetBlockById(Number(id));
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
				onClick={() => router(`/blocks/update/${id}`)}
			>
				<Edit size={16} className="mr-2" /> Chỉnh sửa
			</Button>
		</div>
	);
	if (!id) {
		return (
			<div className="p-1.5 pt-0 space-y-4">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID tòa nhà
				</div>
			</div>
		);
	}
	// bắt buộc phải có loading, nếu không lúc mà fetch data lâu nó sẽ lỗi
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}
	const config = BlockStatusMap[blockData?.status!] ?? {
		label: "Không xác định",
		type: "default",
	};
	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={blockData?.buildingName || "Xem chi tiết khối nhà"}
					showBack
					actions={headerActions}
				/>
				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 relative">
					<StatusBadge
						className="mt-2 mb-4 absolute right-6"
						label={config.label}
						type={config.type}
					/>
					<div className=" flex gap-5">
						<DisplayCard
							label="Tên tòa nhà"
							value={blockData?.buildingName || ""}
						/>
						<DisplayCard
							label="Tên quản lý"
							value={blockData?.managerName || ""}
						/>
						<DisplayCard
							label="Số điện thoại quản lý"
							value={blockData?.managerPhone || ""}
						/>
						<DisplayCard
							label="Tổng số tầng"
							value={blockData?.totalFloors || 0}
						/>
						<DisplayCard
							label="Tổng số phòng"
							value={blockData?.totalRooms || 0}
						/>
					</div>
					<DetailApartmentMatrix block={blockData!} />
				</div>
			</div>
			<DeleteBlock
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
				seclectedBlock={blockData}
			/>
		</>
	);
};
interface DisplayCardProps {
	label: string;
	value: string | number;
}
const DisplayCard = ({ label, value }: DisplayCardProps) => {
	return (
		<div className="p-4 rounded-lg border min-w-[150px] ">
			<div className="display-label">{label}</div>
			<div className="display-text text-center mt-[10px]">{value}</div>
		</div>
	);
};
export default DetailBlockPage;
