import { format } from "date-fns";
import { Info } from "lucide-react";

const ReadOnlyField = ({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) => (
	<div className="flex flex-col gap-1.5">
		<span className="text-sm text-gray-500">{label}</span>
		<div className="text-sm text-black break-words">{value || "---"}</div>
	</div>
);

interface IssueInfoProps {
	issue: any;
}

export const IssueInfoSection = ({ issue }: IssueInfoProps) => {
	return (
		<div className="bg-gray-50/100 p-4 rounded-lg border border-gray-300 space-y-3">
			<div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
				<Info size={18} className="text-main" />
				<span className="text-sm font-bold text-gray-800">
					Thông tin phản ánh
				</span>
			</div>

			<ReadOnlyField label="Tiêu đề" value={issue.title} />

			<div className="grid grid-cols-2 gap-6">
				<ReadOnlyField label="Cư dân" value={issue.reporter?.fullName} />
				<ReadOnlyField
					label="Thời gian tạo"
					value={
						issue.createdAt
							? format(new Date(issue.createdAt), "dd/MM/yyyy HH:mm")
							: ""
					}
				/>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<ReadOnlyField
					label="Khu vực"
					value={`${issue.block?.name} - Tầng ${issue.floor}`}
				/>
				<ReadOnlyField
					label="Loại sự cố"
					value={issue.typeLabel || "Kỹ thuật"}
				/>
			</div>

			<div className="border-t border-gray-200 pt-4 mt-2">
				<ReadOnlyField
					label="Mô tả chi tiết"
					value={
						<div className="bg-white p-3 rounded border border-gray-200 text-sm text-black min-h-[60px] whitespace-pre-wrap">
							{issue.description || "Không có mô tả chi tiết."}
						</div>
					}
				/>
			</div>
		</div>
	);
};
