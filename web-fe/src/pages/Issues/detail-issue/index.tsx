"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Star, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import { toast } from "sonner";

import { useIssue, useUpdateIssue } from "@/hooks/data/useIssues";
import { IssueTypeMap, IssueStatusMap } from "@/constants/issueStatus";

import UpdateIssueModal from "@/pages/Issues/update-issue";
import RejectIssueModal from "@/pages/Issues/reject-issue";

const DetailIssuePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const issueId = Number(id);

	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

	const { data: issue, isLoading, refetch } = useIssue(issueId);
	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue();

	const handleReceive = () => {
		updateIssue(
			{ id: issueId, data: { status: "RECEIVED" } },
			{
				onSuccess: () => {
					toast.success("Đã tiếp nhận phản ánh");
					refetch();
				},
				onError: (err: any) =>
					toast.error(err?.response?.data?.message || "Lỗi tiếp nhận"),
			},
		);
	};

	const formatDateTime = (dateString?: string) => {
		if (!dateString) return "---";
		try {
			return format(new Date(dateString), "dd/MM/yyyy HH:mm");
		} catch {
			return dateString;
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "---";
		try {
			return format(new Date(dateString), "dd/MM/yyyy");
		} catch {
			return dateString;
		}
	};

	const renderStars = (rating?: number) => {
		if (!rating)
			return <span className="text-gray-400 italic">Chưa có đánh giá</span>;
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`w-5 h-5 ${
							star <= rating
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
	};

	// logic nút bấm
	const renderActions = () => {
		if (!issue) return null;

		// PENDING -> từ chối & tiếp nhận
		if (issue.status === "PENDING") {
			return (
				<div className="flex items-center gap-2">
					<Button
						className="h-9 px-3 bg-red-600 text-white border-red-200 hover:bg-red-700 shadow-sm"
						onClick={() => setIsRejectModalOpen(true)}
						disabled={isUpdating}
					>
						<XCircle size={16} className="mr-2" /> Từ chối
					</Button>

					<Button
						className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
						onClick={handleReceive}
						disabled={isUpdating}
					>
						{isUpdating ? (
							<Spinner />
						) : (
							<CheckCircle2 size={16} className="mr-2" />
						)}
						Tiếp nhận
					</Button>
				</div>
			);
		}

		// RECEIVED / PROCESSING -> chỉnh sửa
		if (issue.status === "RECEIVED" || issue.status === "PROCESSING") {
			return (
				<Button
					className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
					onClick={() => setIsUpdateModalOpen(true)}
				>
					<Edit size={16} className="mr-2" /> Chỉnh sửa
				</Button>
			);
		}

		return null;
	};

	if (isLoading)
		return (
			<div className="flex justify-center h-[500px] items-center">
				<Spinner />
			</div>
		);
	if (!issue) return <div>Không tìm thấy...</div>;

	const textColorMap: Record<string, string> = {
		warning: "text-[#D97706]",
		purple: "text-purple-700",
		info: "text-[#1E40AF]",
		success: "text-[#166534]",
		error: "text-[#DC2626]",
		default: "text-gray-700",
	};

	const statusConfig = IssueStatusMap[issue.status] || {
		label: issue.status,
		type: "default",
	};
	const typeConfig = IssueTypeMap[issue.type] || {
		label: "Khác",
		type: "default",
	};

	const hasResults =
		issue.estimatedCompletionDate ||
		issue.status === "RESOLVED" ||
		issue.status === "REJECTED";

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader title={issue.title} showBack actions={renderActions()} />

			<div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-8">
				<div>
					<h2 className="title-text mb-3">Thông tin chung</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
						<div className="space-y-6">
							<div>
								<h3 className="display-label">Cư dân</h3>
								<p className="display-text">
									{issue.reporter?.fullName || "Ẩn danh"}
								</p>
							</div>
							<div>
								<h3 className="display-label">Số điện thoại</h3>
								<p className="display-text">
									{issue.reporter?.phoneNumber || "---"}
								</p>
							</div>
							<div>
								<h3 className="display-label">Trạng thái</h3>
								<div
									className={`display-text ${textColorMap[statusConfig.type] || textColorMap.default}`}
								>
									{statusConfig.label}
								</div>
							</div>
							<div>
								<h3 className="display-label">Loại sự cố</h3>
								<p className="display-text">{typeConfig.label}</p>
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<h3 className="display-label">Thời gian phản ánh</h3>
								<p className="display-text">{formatDate(issue.createdAt)}</p>
							</div>
							<div>
								<h3 className="display-label">Mức độ nghiêm trọng</h3>
								<p
									className={`display-text ${issue.isUrgent ? "text-orange-600" : ""}`}
								>
									{issue.isUrgent ? "Khẩn cấp" : "Bình thường"}
								</p>
							</div>
							<div>
								<h3 className="display-label">Vị trí cụ thể</h3>
								<p className="display-text">
									{issue.block?.name}
									{issue.floor !== undefined && ` - Tầng ${issue.floor}`}
									{issue.detailLocation && ` (${issue.detailLocation})`}
								</p>
							</div>
							{issue.maintenanceTicket && (
								<div>
									<h3 className="display-label">Phiếu sữa chữa liên quan</h3>
									<div
										className="display-text font-semibold text-main hover:underline hover:opacity-90 cursor-pointer transition"
										onClick={() =>
											navigate(`/maintenances/${issue.maintenanceTicket?.id}`)
										}
									>
										# {issue.maintenanceTicket.title}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="w-full h-px bg-gray-300" />

				<div>
					<h2 className="title-text mb-3">Mô tả</h2>
					<div className="display-text whitespace-pre-wrap">
						{issue.description || "Không có mô tả chi tiết."}
					</div>
				</div>

				{issue.fileUrls && issue.fileUrls.length > 0 && (
					<div>
						<h2 className="title-text mb-3">Hình ảnh minh chứng</h2>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{issue.fileUrls.map((url, index) => (
								<div className="overflow-hidden rounded-lg border cursor-pointer group">
									<img
										src={url}
										alt={`Ảnh minh chứng ${index + 1}`}
										className="w-full h-50 object-cover transition-transform duration-300 group-hover:scale-110"
										onClick={() => window.open(url, "_blank")}
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{hasResults && (
					<>
						<div className="w-full h-px bg-gray-300" />

						<div className="space-y-3">
							<h2 className="title-text">Kết quả</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
								{issue.estimatedCompletionDate && (
									<div>
										<h3 className="display-label">Ngày dự kiến hoàn thành</h3>
										<p className="display-text">
											{formatDate(issue.estimatedCompletionDate)}
										</p>
									</div>
								)}

								{issue.status === "RESOLVED" && (
									<>
										<div>
											<h3 className="display-label">Ngày hoàn thành</h3>
											<p className="display-text text-green-700">
												{formatDateTime(issue.updatedAt)}
											</p>
										</div>
										<div className="md:col-span-2">
											<h3 className="display-label mb-1">Mức độ hài lòng</h3>
											{renderStars(issue.rating)}
											{issue.feedback && (
												<p className="display-text mt-1 italic">
													"{issue.feedback}"
												</p>
											)}
										</div>
									</>
								)}

								{issue.status === "REJECTED" && issue.rejectionReason && (
									<div className="md:col-span-2">
										<h3 className="display-label">Lý do từ chối</h3>
										<p className="display-text text-red-800">
											{issue.rejectionReason}
										</p>
									</div>
								)}
							</div>
						</div>
					</>
				)}

				{issue.maintenanceTicket && (
					<div>
						<Button
							className="w-full bg-[#DFA975] hover:bg-[#d4965c] text-black font-medium h-12 flex justify-between px-6 border-none"
							onClick={() =>
								navigate(`/maintenances/${issue.maintenanceTicket?.id}`)
							}
						>
							<span>Xem chi tiết xử lý kỹ thuật</span>
							<div className="flex items-center gap-2">
								<span className="text-sm font-normal opacity-90">
									{issue.maintenanceTicket.title}
								</span>
								<ArrowRight size={18} />
							</div>
						</Button>
					</div>
				)}
			</div>

			{/* --- MODALS --- */}
			{issue && (
				<UpdateIssueModal
					open={isUpdateModalOpen}
					setOpen={setIsUpdateModalOpen}
					issueId={issue.id}
					onSuccess={() => refetch()}
				/>
			)}

			{issue && (
				<RejectIssueModal
					open={isRejectModalOpen}
					setOpen={setIsRejectModalOpen}
					issue={issue}
					onSuccess={() => {
						setIsRejectModalOpen(false);
						refetch();
					}}
				/>
			)}
		</div>
	);
};

export default DetailIssuePage;
