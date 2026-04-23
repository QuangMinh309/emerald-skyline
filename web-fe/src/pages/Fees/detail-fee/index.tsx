import CustomTable from "@/components/common/CustomTable";
import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import { useGetFeeById } from "@/hooks/data/useFees";

import { useParams } from "react-router-dom";

const tierColumns = [
	{ key: "id", label: "ID", align: "center" as const, width: "60px" },
	{ key: "name", label: "Tên bậc", sortable: true },
	{
		key: "fromValue",
		label: "Từ",
		align: "center" as const,
		render: (row: any) => row.fromValue.toLocaleString("vi-VN"),
	},
	{
		key: "toValue",
		label: "Đến",
		align: "center" as const,
		render: (row: any) =>
			row.toValue ? row.toValue.toLocaleString("vi-VN") : "Vô hạn",
	},
	{
		key: "unitPrice",
		label: "Giá đơn vị",
		align: "center" as const,
		render: (row: any) => row.unitPrice.toLocaleString("vi-VN"),
	},
];

const feeTypeMap: Record<string, string> = {
	METERED: "Theo chỉ số",
	FIXED: "Cố định",
	FIXED_AREA: "Cố định theo diện tích",
	FIXED_MONTH: "Cố định hàng tháng",
	OTHER: "Khác",
};

const DetailFeePage = () => {
	const { id } = useParams();
	const { data: fee, isLoading } = useGetFeeById(Number(id));

	if (!id) {
		return (
			<div className="p-1.5 pt-0 space-y-4">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID phí dịch vụ
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader title={fee?.name || "Chi tiết phí dịch vụ"} showBack />
				<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
					</div>
					<div className="space-y-2">
						{/* 4 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
							<div>
								<h3 className="display-label">Tên phí</h3>
								<p className="display-text">{fee?.name}</p>
							</div>

							<div>
								<h3 className="display-label"> Loại phí</h3>
								<p className="display-text">
									{feeTypeMap[fee?.type!] || fee?.type}
								</p>
							</div>

							<div>
								<h3 className="display-label"> Đơn vị</h3>
								<p className="display-text">{fee?.unit}</p>
							</div>
							<div className="col-span-1 sm:col-span-2 lg:col-span-3">
								<h3 className="display-label"> Mô tả</h3>
								<p className="display-text">{fee?.description || "N/A"}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Bảng bậc giá */}
				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Chi tiết bậc giá
						</h3>
						{fee?.tiers && fee.tiers.length > 0 ? (
							<CustomTable
								showCheckbox={false}
								data={fee.tiers}
								columns={tierColumns}
								defaultPageSize={10}
							/>
						) : (
							<div className="bg-gray-50 p-8 rounded text-center text-gray-500">
								Không có dữ liệu bậc giá
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default DetailFeePage;
