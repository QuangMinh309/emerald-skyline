import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	UserCheck,
	Play,
	CheckCircle,
	Wrench,
	LoaderCircle,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";

import { TicketStatusMap } from "@/constants/ticketStatus";
import { TicketTypeOptions } from "@/constants/ticketType";
import {
	TicketPriorityMap,
	TicketPriorityOptions,
} from "@/constants/ticketPriority";
import { MaintenanceResultOptions } from "@/constants/maintenanceResult";

import {
	useMaintenanceTicketDetail,
	useStartMaintenanceWork,
	useUpdateMaintenanceProgress,
} from "@/hooks/data/useMaintenance";

import AssignTechnicianModal from "@/pages/Maintenances/assign-technician";

import type { MaintenanceChecklistItem } from "@/types/maintenance";
import CompleteScheduledMaintenanceModal from "@/pages/Maintenances/scheduled/complete-scheduled-maintenance";
import CompleteIncidentMaintenanceModal from "@/pages/Maintenances/incident/complete-incident-maintenance";
import { Checkbox } from "@/components/ui/checkbox";

const DetailMaintenancePage = () => {
	const { id } = useParams<{ id: string }>();

	const [isAssignOpen, setIsAssignOpen] = useState(false);
	const [isCompleteScheduledOpen, setIsCompleteScheduledOpen] = useState(false);
	const [isCompleteIncidentOpen, setIsCompleteIncidentOpen] = useState(false);
	const [localChecklist, setLocalChecklist] = useState<
		MaintenanceChecklistItem[]
	>([]);
	const ticketId = Number(id);

	const { data: ticket, isLoading } = useMaintenanceTicketDetail(ticketId);
	const finishedTask =
		ticket?.checklistItems?.filter((item) => item.isChecked).length || 0;
	const { mutate: startWork, isPending: isStarting } =
		useStartMaintenanceWork();
	const { mutate: updateProgress, isPending: isUpdatingProgress } =
		useUpdateMaintenanceProgress();

	/* =====================
     Sync checklist
  ===================== */
	useEffect(() => {
		if (ticket?.checklistItems) {
			setLocalChecklist(ticket.checklistItems);
		}
	}, [ticket?.checklistItems]);

	/* =====================
     Handlers
  ===================== */
	const handleStartWork = () => {
		if (!ticketId) return;

		startWork(ticketId, {
			onSuccess: () => toast.success("Đã bắt đầu công việc"),
			onError: (err) => toast.error(`Lỗi: ${err.message}`),
		});
	};

	const handleChecklistChange = (index: number, isChecked: boolean) => {
		const newChecklist = [...localChecklist];
		newChecklist[index] = { ...newChecklist[index], isChecked };
		setLocalChecklist(newChecklist);
	};
	const handleUpdateProgress = () => {
		if (!ticketId) return;

		updateProgress(
			{ id: ticketId, checklistItems: localChecklist },
			{
				onSuccess: () => toast.success("Đã cập nhật tiến độ"),
				onError: (err) => toast.error(`Lỗi: ${err.message}`),
			},
		);
	};
	/* =====================
     Loading & Guard
  ===================== */
	if (!id) {
		return (
			<div className="p-4">
				<div className="bg-red-50 border border-red-200 p-6 rounded text-center text-red-600">
					Không tìm thấy ID yêu cầu bảo trì
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px]">
				<Spinner />
			</div>
		);
	}

	/* =====================
     Derived values
  ===================== */
	const typeOption = TicketTypeOptions.find((o) => o.value === ticket?.type);
	const priorityOption = TicketPriorityOptions.find(
		(o) => o.value === ticket?.priority,
	);
	const resultOption = MaintenanceResultOptions.find(
		(o) => o.value === ticket?.result,
	);

	const statusConfig = TicketStatusMap[ticket?.status!] ?? {
		label: "Không xác định",
		type: "default",
	};

	const priorityConfig = TicketPriorityMap[ticket?.priority!] ?? {
		label: "Không xác định",
		type: "default",
	};

	const canAssign = ticket?.status === "PENDING";
	const canStart = ticket?.status === "ASSIGNED";
	const canComplete = ticket?.status === "IN_PROGRESS";
	const canUpdateProgress = canComplete && ticket.type === "MAINTENANCE";
	/* =====================
     Header Actions
  ===================== */
	const actions = (
		<div className="flex items-center gap-2 w-full justify-end">
			{canAssign && (
				<Button
					className="h-9 px-3 bg-main text-white hover:bg-main/90"
					onClick={() => setIsAssignOpen(true)}
				>
					<UserCheck size={16} className="mr-2" />
					Giao việc
				</Button>
			)}

			{canStart && (
				<Button
					className="h-9 px-3 bg-main text-white hover:bg-main/90"
					onClick={handleStartWork}
					disabled={isStarting}
				>
					{isStarting && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
					<Play size={16} className="mr-2" />
					Bắt đầu
				</Button>
			)}
			{canUpdateProgress && (
				<Button
					disabled={isUpdatingProgress}
					className="h-9 px-3 bg-main text-white hover:bg-main/90"
					onClick={handleUpdateProgress}
				>
					{isUpdatingProgress && (
						<LoaderCircle className="animate-spin mr-2 h-4 w-4" />
					)}
					<Wrench size={16} className="mr-2" />
					Cập nhật tiến độ
				</Button>
			)}
			{canComplete && (
				<Button
					disabled={
						isUpdatingProgress ||
						(finishedTask === 0 && ticket.type === "MAINTENANCE")
					}
					className="h-9 px-3 bg-main text-white hover:bg-main/90"
					onClick={() => {
						if (ticket?.type === "MAINTENANCE") {
							setIsCompleteScheduledOpen(true);
						} else {
							setIsCompleteIncidentOpen(true);
						}
					}}
				>
					<CheckCircle size={16} className="mr-2" />
					Hoàn thành
				</Button>
			)}
		</div>
	);

	/* =====================
     Render
  ===================== */
	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={ticket?.title ?? "Chi tiết yêu cầu bảo trì"}
					showBack
				/>

				<div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					{/* ===== Thông tin chung ===== */}
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
						<StatusBadge label={statusConfig.label} type={statusConfig.type} />
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
						<Info
							label="Loại yêu cầu"
							value={typeOption?.label || ticket?.type}
						/>
						<Info
							label="Độ ưu tiên"
							value={
								<StatusBadge
									label={priorityConfig.label}
									type={priorityConfig.type}
								/>
							}
						/>
						<Info label="Tòa nhà" value={ticket?.blockName} />
						<Info label="Tầng" value={`Tầng ${ticket?.floor}`} />
						<Info label="Tài sản" value={ticket?.assetName || "Không có"} />
						<Info
							label="Loại tài sản"
							value={ticket?.assetTypeName || "Không có"}
						/>
					</div>

					{ticket?.locationDetail && (
						<InfoBlock label="Vị trí chi tiết" value={ticket.locationDetail} />
					)}

					{ticket?.description && (
						<InfoBlock label="Mô tả chi tiết" value={ticket.description} />
					)}

					{/* ===== Kỹ thuật viên ===== */}
					{ticket?.technicianId && (
						<>
							<h2 className="title-text">Kỹ thuật viên phụ trách</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
								<Info label="Tên" value={ticket.technicianName} />
								<Info
									label="SĐT"
									value={ticket.technicianPhone || "Không có"}
								/>
								<Info
									label="Ngày giao việc"
									value={
										ticket.assignedDate
											? new Date(ticket.assignedDate).toLocaleString("vi-VN")
											: "Chưa có"
									}
								/>
							</div>
						</>
					)}

					{/* ===== Checklist ===== */}
					{localChecklist.length > 0 && (
						<>
							<h2 className="title-text">Danh sách công việc</h2>
							<div className="space-y-3">
								{localChecklist.map((item, index) => (
									<div key={index} className="flex items-center gap-3">
										<Checkbox
											checked={item.isChecked}
											disabled={
												ticket?.status !== "IN_PROGRESS" || isUpdatingProgress
											}
											onCheckedChange={(v) =>
												handleChecklistChange(index, v as boolean)
											}
										/>
										<span
											className={`text-sm ${
												item.isChecked
													? "line-through text-gray-400"
													: "text-gray-900"
											}`}
										>
											{item.task}
										</span>
									</div>
								))}
							</div>
						</>
					)}

					{/* ===== Thời gian ===== */}
					<h2 className="title-text">Thông tin thời gian</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
						<Info
							label="Ngày tạo"
							value={new Date(ticket?.createdAt || "").toLocaleString("vi-VN")}
						/>
						<Info
							label="Ngày bắt đầu"
							value={
								ticket?.startedDate
									? new Date(ticket.startedDate).toLocaleString("vi-VN")
									: "Chưa bắt đầu"
							}
						/>
						<Info
							label="Ngày hoàn thành"
							value={
								ticket?.completedDate
									? new Date(ticket.completedDate).toLocaleString("vi-VN")
									: "Chưa hoàn thành"
							}
						/>
					</div>

					{/* ===== Kết quả ===== */}
					{ticket?.status === "COMPLETED" && (
						<>
							<h2 className="title-text">Kết quả bảo trì</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
								<Info
									label="Kết quả"
									value={resultOption?.label || ticket.result}
								/>
								<Info
									label="Chi phí ước tính"
									value={
										ticket.estimatedCost
											? `${ticket.estimatedCost.toLocaleString("vi-VN")} VNĐ`
											: "Không có"
									}
								/>
								<Info
									label="Chi phí thực tế"
									value={
										ticket.actualCost
											? `${ticket.actualCost.toLocaleString("vi-VN")} VNĐ`
											: "Không có"
									}
								/>
							</div>

							{ticket.resultNote && (
								<InfoBlock label="Ghi chú kết quả" value={ticket.resultNote} />
							)}

							{ticket.hasIssue && (
								<InfoBlock
									label="Vấn đề phát sinh"
									value={ticket.issueDetail}
									danger
								/>
							)}
						</>
					)}
					{actions}
				</div>
			</div>

			<AssignTechnicianModal
				open={isAssignOpen}
				setOpen={setIsAssignOpen}
				ticketId={ticketId}
			/>
			<CompleteScheduledMaintenanceModal
				open={isCompleteScheduledOpen}
				setOpen={setIsCompleteScheduledOpen}
				ticketId={ticketId}
			/>
			<CompleteIncidentMaintenanceModal
				open={isCompleteIncidentOpen}
				setOpen={setIsCompleteIncidentOpen}
				ticketId={ticketId}
			/>
		</>
	);
};

export default DetailMaintenancePage;

/* =====================
   Small UI helpers
===================== */
const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
	<div>
		<h3 className="display-label">{label}</h3>
		<p className="display-text">{value || "—"}</p>
	</div>
);

const InfoBlock = ({
	label,
	value,
	danger,
}: {
	label: string;
	value?: React.ReactNode;
	danger?: boolean;
}) => (
	<div>
		<h3 className={`display-label ${danger ? "text-red-600" : ""}`}>{label}</h3>
		<p className={`display-text ${danger ? "text-red-600" : ""}`}>{value}</p>
	</div>
);
