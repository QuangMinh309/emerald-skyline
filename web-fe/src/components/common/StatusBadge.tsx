import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// màu cơ bản
export type StatusType =
	| "success"
	| "warning"
	| "error"
	| "info"
	| "default"
	| "purple";

interface StatusBadgeProps {
	label: string;
	type?: StatusType;
	className?: string;
}

const typeStyles: Record<StatusType, string> = {
	success: "bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7]/80",
	warning: "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7]/80",
	error: "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]/80",
	info: "bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE]/80",
	default: "bg-gray-100 text-gray-700 hover:bg-gray-100/80",
	purple: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
	label,
	type = "default",
	className,
}) => {
	return (
		<Badge
			className={cn(
				"font-medium rounded-md whitespace-nowrap shadow-none px-3 py-1 text-sm min-w-[90px] justify-center transition-colors border-transparent cursor-default",
				typeStyles[type],
				className,
			)}
		>
			{label}
		</Badge>
	);
};

export default StatusBadge;
