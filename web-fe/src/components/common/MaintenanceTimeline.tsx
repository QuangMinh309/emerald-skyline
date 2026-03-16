import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

interface MaintenanceHistoryItem {
	id: number;
	title: string;
	type: string;
	status: string;
	date: string;
	result: string;
	technicianName: string;
}

interface MaintenanceTimelineProps {
	history: MaintenanceHistoryItem[];
}

const getStatusConfig = (status: string) => {
	const configs: Record<
		string,
		{ icon: any; color: string; bgColor: string; label: string }
	> = {
		COMPLETED: {
			icon: CheckCircle2,
			color: "text-green-600",
			bgColor: "bg-green-100",
			label: "Hoàn thành",
		},
		IN_PROGRESS: {
			icon: Clock,
			color: "text-blue-600",
			bgColor: "bg-blue-100",
			label: "Đang thực hiện",
		},
		PENDING: {
			icon: AlertCircle,
			color: "text-yellow-600",
			bgColor: "bg-yellow-100",
			label: "Chờ xử lý",
		},
		CANCELLED: {
			icon: XCircle,
			color: "text-gray-600",
			bgColor: "bg-gray-100",
			label: "Đã hủy",
		},
	};

	return (
		configs[status] || {
			icon: AlertCircle,
			color: "text-gray-600",
			bgColor: "bg-gray-100",
			label: status,
		}
	);
};

const getTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		SCHEDULED: "Bảo trì định kỳ",
		EMERGENCY: "Sửa chữa khẩn cấp",
		REPAIR: "Sửa chữa",
		INSPECTION: "Kiểm tra",
		PREVENTIVE: "Bảo trì phòng ngừa",
	};
	return labels[type] || type;
};

export const MaintenanceTimeline = ({ history }: MaintenanceTimelineProps) => {
	if (!history || history.length === 0) {
		return (
			<div className="bg-gray-50 border border-gray-200 p-8 rounded text-center text-gray-600">
				Chưa có lịch sử bảo trì nào
			</div>
		);
	}

	return (
		<div className="relative space-y-6">
			{/* Vertical line */}
			<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

			{history.map((item) => {
				const config = getStatusConfig(item.status);
				const Icon = config.icon;

				return (
					<div key={item.id} className="relative flex gap-6">
						{/* Icon circle */}
						<div className="relative z-10 flex-shrink-0">
							<div
								className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center border-4 border-white shadow-sm`}
							>
								<Icon className={`w-6 h-6 ${config.color}`} />
							</div>
						</div>

						{/* Content card */}
						<div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 mb-2">
							<div className="flex items-start justify-between mb-2">
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900 text-base">
										{item.title}
									</h3>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-sm text-gray-600">
											{getTypeLabel(item.type)}
										</span>
										<span className="text-gray-400">•</span>
										<span className="text-sm text-gray-500">
											{new Date(item.date).toLocaleDateString("vi-VN", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
											})}
										</span>
									</div>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
								>
									{config.label}
								</span>
							</div>

							<div className="space-y-2 text-sm">
								<div className="flex items-start gap-2">
									<span className="text-gray-500 min-w-[100px]">
										Kỹ thuật viên:
									</span>
									<span className="text-gray-900 font-medium">
										{item.technicianName}
									</span>
								</div>
								{item.result && (
									<div className="flex items-start gap-2">
										<span className="text-gray-500 min-w-[100px]">
											Kết quả:
										</span>
										<span className="text-gray-700">{item.result}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
