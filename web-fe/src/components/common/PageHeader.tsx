import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	showBack?: boolean;
	actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	subtitle,
	showBack = false,
	actions,
}) => {
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-between mb-6">
			<div className="flex items-center gap-3">
				{showBack && (
					<button
						onClick={() => navigate(-1)}
						className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
				)}
				<div>
					<h1 className="text-2xl font-bold text-main">{title}</h1>
					{subtitle && (
						<p className="text-gray-500 text-base mt-1">{subtitle}</p>
					)}
				</div>
			</div>

			{actions && <div className="flex items-center gap-3">{actions}</div>}
		</div>
	);
};

export default PageHeader;
