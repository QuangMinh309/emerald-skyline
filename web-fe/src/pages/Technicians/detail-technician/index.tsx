import { useParams, useNavigate } from "react-router-dom";
import { useGetTechnicianById } from "@/hooks/data/useTechnicians";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { TechnicianStatusMap } from "@/constants/technicianStatus";
import { useState } from "react";
import UpdateTechnicianModal from "../update-technician";
import DeleteTechnicianModal from "../delete-technician";
import StatusBadge from "@/components/common/StatusBadge";
import PageHeader from "@/components/common/PageHeader";

const TechnicianDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: technician, isLoading } = useGetTechnicianById(Number(id) || 0);

	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-muted-foreground">Đang tải...</div>
			</div>
		);
	}

	if (!technician) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-muted-foreground">
					Không tìm thấy kỹ thuật viên
				</div>
			</div>
		);
	}
	const headerActions = (
		<div className="flex items-center gap-2">
			<Button
				className="h-9 px-3 bg-red-600 text-white border-red-200 hover:bg-red-700"
				onClick={() => setShowDeleteModal(true)}
			>
				<Trash2 size={16} className="mr-2" /> Xóa
			</Button>
			<Button
				className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
				onClick={() => setShowUpdateModal(true)}
			>
				<Edit size={16} className="mr-2" /> Chỉnh sửa
			</Button>
		</div>
	);
	const cfg = TechnicianStatusMap[technician?.status ?? ""] || {
		label: technician?.status ?? "Unknown",
		type: "default",
	};
	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={technician?.fullName ?? "Chi tiết kỹ thuật viên"}
					actions={headerActions}
					showBack
				/>
				<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
					</div>
					<div className="space-y-2">
						{/* 4 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
							<div>
								<h3 className="display-label">Mã kỹ thuật viên </h3>
								<p className="display-text">{technician?.id}</p>
							</div>

							<div>
								<h3 className="display-label">Họ tên</h3>
								<p className="display-text">{technician?.fullName}</p>
							</div>

							<div>
								<h3 className="display-label">Số điện thoại</h3>
								<p className="display-text">{technician?.phoneNumber}</p>
							</div>

							<div>
								<h3 className="display-label">Mô tả</h3>
								<p className="display-text">{technician?.description}</p>
							</div>
						</div>
						<div>
							<h3 className="display-label">Trạng thái</h3>
							<StatusBadge label={cfg.label} type={cfg.type} />
						</div>
					</div>
				</div>
			</div>
			{/* Modals */}
			<UpdateTechnicianModal
				open={showUpdateModal}
				setOpen={setShowUpdateModal}
				technician={technician}
			/>
			<DeleteTechnicianModal
				open={showDeleteModal}
				setOpen={setShowDeleteModal}
				technician={technician}
			/>
		</>
	);
};

export default TechnicianDetail;
