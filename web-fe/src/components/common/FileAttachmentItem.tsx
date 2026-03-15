import { FileText, Eye, Download } from "lucide-react";
import { getViewUrl } from "@/utils/file-viewer";
import { forceDownload } from "@/utils/force-download";

interface Props {
	url: string;
	fileName: string;
}

const FileAttachmentItem = ({ url, fileName }: Props) => {
	const viewUrl = getViewUrl(url, fileName);

	return (
		<div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md bg-white hover:border-green-600/50 transition-colors">
			<div className="flex items-center gap-3 overflow-hidden min-w-0">
				<FileText className="w-5 h-5 text-orange-500 shrink-0" />
				<span className="truncate text-sm" title={fileName}>
					{fileName}
				</span>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				{/* xem */}
				<a
					href={viewUrl}
					target="_blank"
					rel="noreferrer"
					className="p-2 rounded hover:bg-green-50 text-gray-500 hover:text-green-700"
					title="Xem"
				>
					<Eye size={18} />
				</a>

				{/* tải */}
				<button
					onClick={() => forceDownload(url, fileName)}
					className="p-2 rounded hover:bg-green-50 text-gray-500 hover:text-green-700"
					title="Tải xuống"
				>
					<Download size={18} />
				</button>
			</div>
		</div>
	);
};

export default FileAttachmentItem;
