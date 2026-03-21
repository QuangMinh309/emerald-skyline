import type { TableColumn } from "@/types";
import type { Resident } from "@/types/resident";

export const residentColumns: TableColumn<Resident>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "fullName", label: "Họ và tên", sortable: true },
	{ key: "citizenId", label: "CCCD", align: "center", sortable: true },
	{
		key: "dob",
		label: "Ngày sinh",
		sortable: true,
		align: "center",
		render: (row) =>
			new Date(row.dob).toLocaleDateString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),
	},
	{
		key: "gender",
		label: "Giới tính",
		align: "center",
		render: (row) => {
			if (row.gender === "FEMALE") return "Nữ";
			if (row.gender === "MALE") return "Nam";
			return "Khác";
		},
	},
	{
		key: "phoneNumber",
		label: "Số điện thoại",
		align: "center",
		sortable: true,
	},
	{
		key: "account",
		label: "Email",
		render: (row) => row.account.email,
	},
	{
		key: "residences",
		label: "Căn hộ đang ở",
		render: (row) => {
			if (!row.residences || row.residences.length === 0) {
				return <span className="text-gray-400">Không có</span>;
			}
			return (
				<div className="space-y-1">
					{row.residences.map((residence) => (
						<div key={residence.id} className="text-sm">
							<span className="font-medium">
								{residence.apartment.blockName}
							</span>
							{" - "}
							<span>{residence.apartment.roomNumber}</span>
							<span className="text-gray-500 text-xs ml-1">
								({residence.relationship})
							</span>
						</div>
					))}
				</div>
			);
		},
	},
];
