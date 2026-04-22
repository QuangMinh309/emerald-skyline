"use client";

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Edit, Trash2, CalendarClock, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DeleteVotingModal from "@/pages/Votings/delete-voting";
import StatCard from "@/components/common/StatCard";
import Spinner from "@/components/common/Spinner";
import FileAttachmentItem from "@/components/common/FileAttachmentItem";
import { PrintableVotingResult } from "./print";

import { useVoting, useVotingStatistics } from "@/hooks/data/useVotings";

const COLOR_PALETTE = [
	{ main: "#5470C6", light: "#E8F0FE" },
	{ main: "#91CC75", light: "#EDF7E6" },
	{ main: "#FAC858", light: "#FEFBE8" },
	{ main: "#EE6666", light: "#FDE8E8" },
	{ main: "#73C0DE", light: "#EAF6FB" },
	{ main: "#3BA272", light: "#E6F6EF" },
	{ main: "#FC8452", light: "#FFF0EB" },
];

const statusMap: Record<string, { label: string; className: string }> = {
	ONGOING: { label: "Đang diễn ra", className: "text-blue-700" },
	ENDED: { label: "Đã kết thúc", className: "text-emerald-700" },
	UPCOMING: { label: "Sắp diễn ra", className: "text-purple-700" },
};

const scopeMap: Record<string, string> = {
	ALL: "Toàn chung cư",
	BLOCK: "Theo tòa nhà",
	FLOOR: "Theo tầng",
};

const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[160px]">
				<p className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2">
					{data.name}
				</p>
				<div className="space-y-1">
					<div className="flex justify-between items-center text-xs">
						<span className="text-gray-500 font-medium">Diện tích:</span>
						<span className="font-bold text-gray-700">
							{new Intl.NumberFormat("vi-VN").format(data.value)} m²
						</span>
					</div>
					<div className="flex justify-between items-center text-xs">
						<span className="text-gray-500 font-medium">Tỷ lệ:</span>
						<span className="font-bold" style={{ color: data.fill }}>
							{data.percentage?.toFixed(2)}%
						</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
};

const DetailVotingPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const votingId = Number(id);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data: voting, isLoading: loadingInfo } = useVoting(votingId);

	// id = null khi UPCOMING
	const shouldFetchStats =
		voting?.status === "ONGOING" || voting?.status === "ENDED";
	const statsId = shouldFetchStats ? votingId : null;

	const { data: stats, isLoading: loadingStats } = useVotingStatistics(
		statsId as number,
	);

	const isLoading = loadingInfo || (shouldFetchStats && loadingStats);

	const formatDate = (dateString?: string) => {
		if (!dateString) return "---";
		try {
			return format(new Date(dateString), "dd/MM/yyyy HH:mm");
		} catch {
			return dateString;
		}
	};

	const formatArea = (area: number | undefined | null) => {
		if (area === undefined || area === null) return "0";
		return new Intl.NumberFormat("vi-VN").format(area);
	};

	const capitalizeFirst = (text: string) =>
		text.charAt(0).toUpperCase() + text.slice(1);

	const timeLeft = useMemo(() => {
		if (!voting?.startTime || !voting?.endTime) return "---";
		const start = new Date(voting.startTime);
		const end = new Date(voting.endTime);
		const now = new Date();

		if (now < start) {
			return capitalizeFirst(
				formatDistanceToNow(start, { addSuffix: true, locale: vi }),
			);
		}
		if (now > end) return "Đã kết thúc";
		return capitalizeFirst(
			formatDistanceToNow(end, { addSuffix: true, locale: vi }),
		);
	}, [voting?.startTime, voting?.endTime]);

	const optionColorMap = useMemo(() => {
		const map: Record<number, { main: string; light: string }> = {};
		if (voting?.options) {
			voting.options.forEach((opt, index) => {
				map[opt.id] = COLOR_PALETTE[index % COLOR_PALETTE.length];
			});
		}
		return map;
	}, [voting]);

	const chartData = useMemo(() => {
		if (!stats?.results) return [];
		return stats.results.map((item) => ({
			name: item.optionName,
			value: item.totalArea,
			percentage: item.percentage,
			fill: optionColorMap[item.optionId]?.main || COLOR_PALETTE[0].main,
		}));
	}, [stats, optionColorMap]);

	const leadingOptionName = useMemo(() => {
		if (!stats?.results || stats.results.length === 0) return "Chưa có";
		const sorted = [...stats.results].sort((a, b) => b.totalArea - a.totalArea);
		return sorted[0].totalArea > 0 ? sorted[0].optionName : "Chưa có";
	}, [stats]);

	// logic ẩn nút sửa/xóa/in
	const isUpcoming = voting?.status === "UPCOMING";
	const canPrint = voting?.status === "ONGOING" || voting?.status === "ENDED";

	const headerActions = (
		<div className="flex items-center gap-2">
			{canPrint && (
				<Button
					className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
					onClick={() => window.print()}
				>
					<Printer size={16} className="mr-2" /> In biểu quyết
				</Button>
			)}

			{isUpcoming && (
				<>
					<Button
						className="h-9 px-3 bg-red-600 text-white border-red-200 hover:bg-red-700"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Trash2 size={16} className="mr-2" /> Xóa
					</Button>
					<Button
						className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
						onClick={() => navigate(`/votings/update/${votingId}`)}
					>
						<Edit size={16} className="mr-2" /> Chỉnh sửa
					</Button>
				</>
			)}
		</div>
	);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}

	if (!voting) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-red-500">
				<p>Không tìm thấy biểu quyết.</p>
				<Button variant="link" onClick={() => navigate(-1)}>
					Quay lại
				</Button>
			</div>
		);
	}

	const statusConfig = statusMap[voting.status] || {
		label: voting.status,
		className: "text-gray-700",
	};

	return (
		<>
			{canPrint && stats && (
				<PrintableVotingResult voting={voting} stats={stats} />
			)}

			<div className="p-1.5 pt-0 space-y-4 print:hidden">
				<PageHeader title={voting.title} showBack actions={headerActions} />

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						title="Tổng diện tích"
						value={stats ? `${formatArea(stats.totalEligibleArea)} m²` : "---"}
						note="Đủ điều kiện"
						accent="green"
					/>
					<StatCard
						title="Đã tham gia"
						value={
							!isUpcoming
								? `${formatArea(stats?.votedArea)} m²`
								: "Chưa diễn ra"
						}
						note={
							!isUpcoming
								? `${stats?.participationRate.toFixed(2) || 0}% tỷ lệ tham gia`
								: "Chờ bắt đầu"
						}
						accent="blue"
					/>
					<StatCard
						title="Dẫn đầu"
						value={!isUpcoming ? leadingOptionName : "---"}
						note={!isUpcoming ? "Phương án cao nhất" : "Chờ kết quả"}
						accent="purple"
					/>
					<StatCard
						title={isUpcoming ? "Sắp diễn ra trong" : "Thời gian còn lại"}
						value={timeLeft}
						note={statusConfig.label}
						accent="amber"
					/>
				</div>

				<div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
						<div className="space-y-6">
							<div>
								<h3 className="display-label">Ngày bắt đầu</h3>
								<p className="display-text">{formatDate(voting.startTime)}</p>
							</div>
							<div>
								<h3 className="display-label">Tổng số cử tri</h3>
								<p className="display-text">
									{voting.totalEligibleVoters || "---"} cư dân
								</p>
							</div>
							<div>
								<h3 className="display-label">Trạng thái</h3>
								<p className={`display-text ${statusConfig.className}`}>
									{statusConfig.label}
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<h3 className="display-label">Ngày kết thúc</h3>
								<p className="display-text">{formatDate(voting.endTime)}</p>
							</div>
							<div>
								<h3 className="display-label">Đã tham gia bỏ phiếu</h3>
								{isUpcoming ? (
									<p className="display-text text-gray-400 italic">
										Chưa bắt đầu
									</p>
								) : (
									<div className="flex items-center gap-2">
										<p className="display-text">
											{voting.votingRatio || "0/0"} cư dân
										</p>
									</div>
								)}
							</div>
							<div>
								<h3 className="display-label">Tính chất</h3>
								<p
									className={`display-text ${voting.isRequired ? "text-red-600" : "text-blue-600"}`}
								>
									{voting.isRequired ? "Bắt buộc" : "Tự nguyện"}
								</p>
							</div>
						</div>
					</div>

					<div>
						<h2 className="title-text mb-3">Kết quả biểu quyết</h2>

						{isUpcoming ? (
							<div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
								<div className="bg-purple-100 p-4 rounded-full mb-4">
									<CalendarClock className="w-8 h-8 text-purple-600" />
								</div>
								<h3 className="title-text text-black text-center">
									Cuộc biểu quyết chưa bắt đầu
								</h3>
								<p className="display-label mt-2 max-w-md text-center leading-relaxed">
									Kết quả thống kê và biểu đồ sẽ được hiển thị tại đây khi cuộc
									biểu quyết chính thức diễn ra vào lúc{" "}
									<span className="display-text font-semibold">
										{formatDate(voting.startTime)}
									</span>
									.
								</p>
							</div>
						) : (
							<>
								<Alert className="w-full bg-third mb-6 shadow-sm flex items-start p-4">
									<div className="ml-3 w-full">
										<AlertTitle className="title-text flex items-center justify-between w-full">
											<span>
												Quy định biểu quyết theo Thông tư 05/2024/TT-BXD
											</span>
										</AlertTitle>
										<AlertDescription className="mt-3 space-y-4">
											<div className="display-text">
												Quyền biểu quyết được tính theo diện tích sở hữu riêng
												của chủ sở hữu căn hộ. Trọng số biểu quyết được tính
												theo diện tích
											</div>
											<div className="flex items-center justify-center gap-3 bg-white/60 py-3 rounded-md border-l-4 border-secondary">
												<span className="text-main font-bold title-text">
													1 m² = 1 đơn vị biểu quyết
												</span>
											</div>
											<div className="pt-2 border-t border-main/10">
												<div className="flex flex-col gap-2">
													<div className="flex justify-between items-center">
														<span className="display-label font-semibold">
															Công thức tính tỷ lệ
														</span>
													</div>
													<div className="text-main p-3 rounded-md display-text text-center font-semibold border border-gray-500">
														Số phiếu tán thành / Tổng số phiếu hợp lệ
													</div>
												</div>
											</div>
										</AlertDescription>
									</div>
								</Alert>

								<div className="space-y-6">
									{stats?.votedArea && (
										<div className="w-full mb-8">
											<h2 className="label-text font-semibold mb-1">
												Tổng: {formatArea(stats.votedArea)} m² đã bỏ phiếu
											</h2>
											<div className="w-[500px] flex items-end">
												<div className="h-[2.5px] w-[220px] bg-main rounded-l-[0px]"></div>
												<div className="relative h-[7px] w-[21px]">
													<svg
														className="absolute inset-0 w-full h-full"
														viewBox="0 0 20 6"
														fill="none"
														preserveAspectRatio="none"
													>
														<line
															x1="0"
															y1="5"
															x2="20"
															y2="0.9"
															stroke="#D1D5DB"
															strokeWidth="2"
														/>
													</svg>
												</div>
												<div className="h-[1.7px] bg-gray-300 flex-1 mb-[5px]"></div>
											</div>
										</div>
									)}

									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
										{/* chart */}
										<div className="h-[280px] w-full flex items-center justify-center relative">
											{chartData.length > 0 && stats?.votedArea ? (
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={chartData}
															cx="50%"
															cy="50%"
															innerRadius={70}
															outerRadius={90}
															paddingAngle={3}
															cornerRadius={5}
															dataKey="value"
															stroke="none"
														>
															{chartData.map((entry, index) => (
																<Cell
																	key={`cell-${index}`}
																	fill={entry.fill}
																	className="outline-none focus:outline-none hover:opacity-90 transition-opacity"
																/>
															))}
														</Pie>
														<Tooltip content={<CustomTooltip />} />
													</PieChart>
												</ResponsiveContainer>
											) : (
												<div className="flex flex-col items-center justify-center text-gray-300 gap-2">
													<span className="text-sm font-medium italic">
														Chưa có dữ liệu biểu đồ
													</span>
												</div>
											)}
										</div>

										<div className="w-full max-w-md mx-auto space-y-3">
											{voting.options.map((opt) => {
												const result = stats?.results.find(
													(r) => r.optionId === opt.id,
												);
												const theme =
													optionColorMap[opt.id] || COLOR_PALETTE[0];
												const color = theme.main;
												const lightBgColor = theme.light;

												return (
													<div
														key={opt.id}
														className="p-3 rounded-xl border flex justify-between items-center transition-all hover:shadow-sm hover:-translate-y-[1px]"
														style={{
															backgroundColor: lightBgColor,
															borderColor: color,
														}}
													>
														<div className="flex items-center gap-3 flex-1 min-w-0">
															<div
																className="w-4 h-4 rounded-[4px] shadow-sm shrink-0"
																style={{ backgroundColor: color }}
															></div>
															<div className="truncate pr-2">
																<h3
																	className="font-bold text-gray-800 text-sm leading-tight truncate"
																	title={opt.name}
																>
																	{opt.name}
																</h3>
															</div>
														</div>

														{result && (
															<div className="text-right pl-4 shrink-0 flex flex-col items-end">
																<div
																	className="text-lg font-black leading-none"
																	style={{ color: color }}
																>
																	{result.percentage.toFixed(2)}%
																</div>
																<div className="text-xs font-semibold text-gray-500 mt-1">
																	{formatArea(result.totalArea)} m²
																</div>
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<div className="w-full h-px bg-gray-100" />

					{/* option */}
					{voting.options && voting.options.length > 0 && (
						<div>
							<h2 className="title-text mb-4">Các phương án biểu quyết</h2>
							<div className="flex flex-col gap-4">
								{voting.options.map((opt) => (
									<div
										key={opt.id}
										className="border border-gray-300 rounded-lg overflow-hidden"
									>
										<div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
											<h3 className="text-base font-medium">{opt.name}</h3>
										</div>

										<div className="p-4 bg-white">
											<p className="display-text whitespace-pre-wrap">
												{opt.description || "Không có mô tả phương án."}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div>
						<h2 className="title-text mb-3">Mô tả</h2>
						<div className="display-text whitespace-pre-wrap">
							{voting.content || "Không có mô tả chi tiết."}
						</div>
					</div>

					{voting.fileUrls && voting.fileUrls.length > 0 && (
						<div>
							<h2 className="title-text mb-3">Tài liệu đính kèm</h2>
							<div className="flex flex-col gap-2">
								{voting.fileUrls.map((url, index) => {
									const rawFileName =
										url.split("/").pop() || `File ${index + 1}`;
									const cleanFileName = rawFileName.split("?")[0];
									const fileName = decodeURIComponent(cleanFileName);
									return (
										<FileAttachmentItem
											key={index}
											url={url}
											fileName={fileName}
										/>
									);
								})}
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
						<div className="space-y-3">
							<h2 className="title-text">Đối tượng biểu quyết</h2>
							<div className="space-y-3">
								<div>
									<p className="display-text">
										{scopeMap[voting.targetScope || "ALL"]}
									</p>
								</div>
								{voting.targetScope !== "ALL" && (
									<div className="mt-4">
										<h3 className="display-label mb-2 font-medium">
											Chi tiết đối tượng
										</h3>
										<div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
											<div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-gray-200">
												{voting.targetBlocks?.map((tb, idx) => (
													<div
														key={idx}
														className="grid grid-cols-[140px_1fr] gap-4 p-3 transition-colors items-center"
													>
														<div className="flex items-center">
															<span
																className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-third text-main text-sm font-semibold border border-secondary/30 truncate w-full text-center shadow-sm"
																title={tb.blockName || `Tòa ${tb.blockId}`}
															>
																{tb.blockName || `Tòa ${tb.blockId}`}
															</span>
														</div>
														<div className="text-sm">
															{tb.targetFloorNumbers?.length > 0 ? (
																<span className="flex items-center gap-1.5">
																	<span className="text-secondary font-medium text-sm">
																		Tầng:
																	</span>
																	<span className="font-medium text-gray-700">
																		{tb.targetFloorNumbers.join(", ")}
																	</span>
																</span>
															) : (
																<span className="text-secondary font-medium text-sm">
																	Toàn bộ tòa
																</span>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<DeleteVotingModal
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
				selectedItem={voting}
				onSuccess={() => navigate("/votings")}
			/>
		</>
	);
};

export default DetailVotingPage;
