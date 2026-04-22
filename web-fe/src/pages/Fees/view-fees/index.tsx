import { useState, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";

import { feeColumns } from "./columns";
import { normalizeString } from "@/utils/string";
import { useNavigate } from "react-router-dom";
import { useFees } from "@/hooks/data/useFees";

const FeesPage = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	// Lấy dữ liệu từ Hooks
	const { data: fees = [], isLoading, isError, error, refetch } = useFees();

	// Logic lọc dữ liệu Fees
	const filteredFees = useMemo(() => {
		let result = [...fees];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter(
				(item) =>
					normalizeString(item.name).includes(search) ||
					normalizeString(item.unit).includes(search) ||
					normalizeString(item.type).includes(search),
			);
		}

		return result;
	}, [fees, searchTerm]);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title="Phí dịch vụ"
					subtitle="Quản lý danh sách các loại phí trong chung cư"
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<SearchBar
						placeholder="Tìm kiếm theo tên phí, đơn vị, loại phí..."
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu phí dịch vụ...
						</div>
					) : isError ? (
						<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
							<p className="font-medium">Không thể tải dữ liệu!</p>
							<p className="text-sm">{(error as Error)?.message}</p>
							<button
								onClick={() => refetch()}
								className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
							>
								Thử lại ngay
							</button>
						</div>
					) : (
						<CustomTable
							showCheckbox={false}
							data={filteredFees}
							columns={feeColumns}
							defaultPageSize={10}
							onView={(row) => navigate(`/fees/${row.id}`)}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default FeesPage;
