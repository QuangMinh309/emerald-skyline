import CustomTable from "@/components/common/CustomTable";
import PageHeader from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import Spinner from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApartmentStatusMap } from "@/constants/apartmentStatus";
import { useGetApartmentById } from "@/hooks/data/useApartments";
import DeleteApartment from "@/pages/Apartments/delete-apartment";
import UpdateApartmentModal from "@/pages/Apartments/update-apartment";
import { normalizeString } from "@/utils/string";
import { Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const residentColumns = [
	{ key: "stt", label: "STT", align: "center" as const },
	{ key: "fullName", label: "Họ và tên", sortable: true },
	{ key: "gender", label: "Giới tính", align: "center" as const },
	{ key: "phone", label: "Số điện thoại", align: "center" as const },
	{ key: "identityCard", label: "CMND/CCCD", align: "center" as const },
	{
		key: "relationship",
		label: "Quan hệ",
		sortable: true,
		align: "center" as const,
		render: (row: any) => {
			const relationshipMap: Record<string, string> = {
				SPOUSE: "Vợ/Chồng",
				CHILD: "Con",
				PARTNER: "Ở ghép",
				OWNER: "Chủ hộ",
			};
			return relationshipMap[row.relationship] || row.relationship;
		},
	},
];

const DetailApartmentPage = () => {
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const { id } = useParams();
	const { data: apartment, isLoading } = useGetApartmentById(Number(id));
	const [search, setSearch] = useState("");

	const filteredResidents = useMemo(() => {
		if (!apartment?.residents || !search.trim())
			return apartment?.residents || [];
		const s = normalizeString(search);
		return apartment.residents.filter(
			(r) =>
				normalizeString(r.fullName).includes(s) ||
				normalizeString(r.phone).includes(s) ||
				normalizeString(r.relationship).includes(s),
		);
	}, [apartment?.residents, search]);
	const headerActions = (
		<div className="flex items-center gap-2">
			<Button
				className="h-9 px-3 bg-red-600 text-white border-red-200 hover:bg-red-700"
				onClick={() => setIsDeleteOpen(true)}
			>
				<Trash2 size={16} className="mr-2" /> Xóa
			</Button>
			<Button
				className="h-9 px-4 bg-[#1F4E3D] hover:bg-[#16382b] text-white shadow-sm"
				onClick={() => setIsUpdateOpen(true)}
			>
				<Edit size={16} className="mr-2" /> Chỉnh sửa
			</Button>
		</div>
	);
	if (!id) {
		return (
			<div className="p-1.5 pt-0 space-y-4">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID tòa nhà
				</div>
			</div>
		);
	}
	// bắt buộc phải có loading, nếu không lúc mà fetch data lâu nó sẽ lỗi
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[500px] ">
				<Spinner />
			</div>
		);
	}
	const config = ApartmentStatusMap[apartment?.generalInfo.status!] ?? {
		label: "Không xác định",
		type: "default",
	};
	return (
		<>
			<div className="p-1.5 pt-0 space-y-4">
				<PageHeader
					title={apartment?.generalInfo.apartmentName ?? "Chi tiết căn hộ"}
					showBack
					actions={headerActions}
				/>
				<div className="bg-white p-4 pt-6 pb-6 rounded-sm border border-gray-200 shadow-sm space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="title-text">Thông tin chung</h2>
						<StatusBadge label={config.label} type={config.type} />
					</div>
					<div className="space-y-2">
						{/* 4 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
							<div>
								<h3 className="display-label">Loại căn hộ</h3>
								<p className="display-text">{apartment?.generalInfo.type}</p>
							</div>

							<div>
								<h3 className="display-label">Tòa nhà</h3>
								<p className="display-text">
									{apartment?.generalInfo.building}
								</p>
							</div>

							<div>
								<h3 className="display-label">Tầng</h3>
								<p className="display-text">
									Tầng {apartment?.generalInfo.floor}
								</p>
							</div>

							<div>
								<h3 className="display-label">Diện tích</h3>
								<p className="display-text">{apartment?.generalInfo.area} m²</p>
							</div>
						</div>
					</div>

					<div>
						<h2 className="title-text">Thông tin chủ hộ</h2>
					</div>
					<div className="space-y-2">
						{/* 3 cột thông tin */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
							<div>
								<h3 className="display-label">Họ và tên</h3>
								<p className="display-text">{apartment?.owner.fullName}</p>
							</div>

							<div>
								<h3 className="display-label">Số điện thoại</h3>
								<p className="display-text">{apartment?.owner.phone}</p>
							</div>

							<div>
								<h3 className="display-label">CMND/CCCD</h3>
								<p className="display-text">{apartment?.owner.identityCard}</p>
							</div>
						</div>
					</div>

					<div>
						<h2 className="title-text">Danh sách cư dân</h2>
					</div>
					<div className="bg-white p-4 rounded border shadow-sm">
						<SearchBar
							placeholder="Tìm theo tên, số điện thoại, quan hệ..."
							onSearch={setSearch}
						/>
					</div>

					<div>
						{apartment?.residents && apartment.residents.length > 0 ? (
							<CustomTable
								showCheckbox={false}
								data={filteredResidents}
								columns={residentColumns}
								defaultPageSize={10}
							/>
						) : (
							<div className="bg-white p-12 text-center text-gray-500 border rounded">
								Chưa có cư dân nào
							</div>
						)}
					</div>
				</div>
			</div>
			<DeleteApartment
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
				selectedApartment={{
					id: Number(id || 0),
					roomName: apartment?.generalInfo.apartmentName || "",
					type: apartment?.generalInfo.type || "",
					block: apartment?.generalInfo.building || "",
					floor: apartment?.generalInfo.floor || 0,
					area: apartment?.generalInfo.area || "",
					owner: apartment?.owner.fullName || "",
					status: apartment?.generalInfo.status || "Trống",
				}}
			/>
			<UpdateApartmentModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				apartmentId={Number(id)}
			/>
		</>
	);
};

export default DetailApartmentPage;
