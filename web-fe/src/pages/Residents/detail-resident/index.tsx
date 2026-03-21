import PageHeader from "@/components/common/PageHeader";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import CustomTable from "@/components/common/CustomTable";
import {
	useGetInvoicesAndPaymentsByResidentId,
	useGetResidentById,
	useGetResidentResidences,
} from "@/hooks/data/useResidents";
import { useParams } from "react-router-dom";
import type { TableColumn } from "@/types";
import type { Invoice } from "@/types/invoice";
import { formatVND } from "@/utils/money";
import { InvoiceStatusMap } from "@/constants/invoiceStatus";

const invoiceColumns: TableColumn<Invoice>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "invoiceCode", label: "Mã hóa đơn", sortable: true },
	{ key: "apartmentId", label: "Mã căn hộ", sortable: true, align: "center" },
	{
		key: "period",
		label: "Kỳ thanh toán",
		sortable: true,
		render: (row) =>
			new Date(row.period).toLocaleDateString("vi-VN", {
				year: "numeric",
				month: "2-digit",
			}),
	},
	{
		key: "totalAmount",
		label: "Tổng tiền",
		align: "right",
		sortable: true,
		render: (row) => formatVND(Number(row.totalAmount)),
	},
	{
		key: "status",
		label: "Trạng thái",
		align: "center",
		width: "150px",
		render: (row) => {
			const config = InvoiceStatusMap[row.status];
			return <StatusBadge label={config.label} type={config.type} />;
		},
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		sortable: true,
		render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
	},
];

const DetailResidentPage = () => {
	const { id } = useParams();
	const { data: resident, isLoading } = useGetResidentById(Number(id));
	const { data: invoicesAndPayments = [], isLoading: isInvoicesLoading } =
		useGetInvoicesAndPaymentsByResidentId(Number(id));
	const { data: residencesData, isLoading: isResidencesLoading } =
		useGetResidentResidences(Number(id));

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader title={resident?.fullName ?? "Chi tiết cư dân"} showBack />

			<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
				{/* Ảnh đại diện và trạng thái */}
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-4">
						{resident?.imageUrl ? (
							<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
								<img
									src={resident.imageUrl}
									alt={resident.fullName}
									className="w-full h-full object-cover"
								/>
							</div>
						) : (
							<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
								{resident?.fullName.charAt(0)}
							</div>
						)}
						<div>
							<h2 className="text-2xl font-semibold">{resident?.fullName}</h2>
							<p className="text-gray-500">{resident?.account.email}</p>
						</div>
					</div>
					{resident?.isActive ? (
						<StatusBadge label="Hoạt động" type="success" />
					) : (
						<StatusBadge label="Ngưng hoạt động" type="error" />
					)}
				</div>

				{/* Thông tin cá nhân */}
				<div>
					<h2 className="title-text">Thông tin cá nhân</h2>
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
						<div>
							<h3 className="display-label">CCCD</h3>
							<p className="display-text">{resident?.citizenId}</p>
						</div>

						<div>
							<h3 className="display-label">Ngày sinh</h3>
							<p className="display-text">
								{new Date(resident?.dob || "").toLocaleDateString("vi-VN")}
							</p>
						</div>

						<div>
							<h3 className="display-label">Giới tính</h3>
							<p className="display-text">{resident?.gender}</p>
						</div>

						<div>
							<h3 className="display-label">Quốc tịch</h3>
							<p className="display-text">{resident?.nationality}</p>
						</div>
					</div>
				</div>

				{/* Thông tin liên hệ */}
				<div>
					<h2 className="title-text">Thông tin liên hệ</h2>
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
						<div>
							<h3 className="display-label">Số điện thoại</h3>
							<p className="display-text">{resident?.phoneNumber}</p>
						</div>

						<div>
							<h3 className="display-label">Email</h3>
							<p className="display-text">{resident?.account.email}</p>
						</div>

						<div>
							<h3 className="display-label">Vai trò tài khoản</h3>
							<p className="display-text">{resident?.account.role}</p>
						</div>
					</div>
				</div>

				{/* Quê quán */}
				<div>
					<h2 className="title-text">Quê quán</h2>
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
						<div>
							<h3 className="display-label">Tỉnh/Thành phố</h3>
							<p className="display-text">{resident?.province}</p>
						</div>

						<div>
							<h3 className="display-label">Phường/Xã</h3>
							<p className="display-text">{resident?.ward}</p>
						</div>
					</div>
				</div>

				{/* Thông tin tài khoản */}
				<div>
					<h2 className="title-text">Thông tin tài khoản</h2>
				</div>
				<div className="space-y-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
						<div>
							<h3 className="display-label">Ngày tạo tài khoản</h3>
							<p className="display-text">
								{new Date(resident?.account.createdAt || "").toLocaleDateString(
									"vi-VN",
								)}
							</p>
						</div>

						<div>
							<h3 className="display-label">Cập nhật lần cuối</h3>
							<p className="display-text">
								{new Date(resident?.account.updatedAt || "").toLocaleDateString(
									"vi-VN",
								)}
							</p>
						</div>

						<div>
							<h3 className="display-label">Trạng thái tài khoản</h3>
							<p className="display-text">
								{resident?.account.isActive ? (
									<StatusBadge label="Kích hoạt" type="success" />
								) : (
									<StatusBadge label="Chưa kích hoạt" type="error" />
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Thông tin cu tru */}
				<div>
					<h2 className="title-text">Thông tin cư trú </h2>
				</div>
				{isResidencesLoading ? (
					<div className="bg-white p-6 text-center text-gray-500 border rounded shadow-sm">
						Đang tải thông tin cư trú...
					</div>
				) : residencesData && residencesData.residences.length > 0 ? (
					<div className="flex flex-wrap gap-10">
						{residencesData.residences.map((residence) => (
							<Card
								key={residence.id}
								apartmentName={`${residence.apartment.blockName} - ${residence.apartment.roomNumber}`}
								relationship={residence.relationship}
								area={residence.apartment.area}
							/>
						))}
					</div>
				) : (
					<div className="bg-gray-50 border border-gray-200 p-8 rounded text-center text-gray-600">
						Không có thông tin cư trú
					</div>
				)}

				{/* hoa don */}
				<div>
					<h2 className="title-text">Hóa đơn </h2>
				</div>
				{isInvoicesLoading ? (
					<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
						Đang tải dữ liệu hóa đơn...
					</div>
				) : invoicesAndPayments &&
					"invoices" in invoicesAndPayments &&
					invoicesAndPayments.invoices.length > 0 ? (
					<CustomTable
						showCheckbox={false}
						data={invoicesAndPayments.invoices as any}
						columns={invoiceColumns}
						defaultPageSize={10}
					/>
				) : (
					<div className="bg-gray-50 border border-gray-200 p-8 rounded text-center text-gray-600">
						Không có hóa đơn nào
					</div>
				)}
			</div>
		</div>
	);
};
interface CardProps {
	apartmentName: string;
	relationship: string;
	area: number;
}
const Card = ({ apartmentName, relationship, area }: CardProps) => {
	const relationshipMap: { [key: string]: string } = {
		OWNER: "Chủ hộ",
		FAMILY_MEMBER: "Thành viên",
		TENANT: "Người thuê",
	};

	return (
		<div className="rounded-lg border p-4 w-[300px]">
			<div className="flex items-center justify-between mb-2">
				<h3 className="display-label">Căn hộ</h3>
				<p className="display-text font-semibold">{apartmentName}</p>
			</div>
			<div className="flex items-center justify-between mb-2">
				<h3 className="display-label">Quan hệ</h3>
				<p className="display-text">
					{relationshipMap[relationship] || relationship}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<h3 className="display-label">Diện tích</h3>
				<p className="display-text">{area} m²</p>
			</div>
		</div>
	);
};
export default DetailResidentPage;
