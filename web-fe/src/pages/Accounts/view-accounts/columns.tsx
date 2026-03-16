import type { TableColumn } from "@/types";
import type { Account } from "@/types/account";
import StatusBadge from "@/components/common/StatusBadge";

const roleMap: Record<string, { label: string; color: string }> = {
	ADMIN: { label: "Quản trị viên", color: "bg-purple-100 text-purple-700" },
	RESIDENT: { label: "Cư dân", color: "bg-blue-100 text-blue-700" },
	TECHNICIAN: { label: "Kỹ thuật viên", color: "bg-green-100 text-green-700" },
};

export const accountColumns: TableColumn<Account>[] = [
	{ key: "stt", label: "STT", align: "center" },
	{ key: "email", label: "Email", sortable: true },
	{
		key: "role",
		label: "Vai trò",
		align: "center",
		filterable: true,

		render: (row) => {
			const roleConfig = roleMap[row.role] || {
				label: row.role,
				color: "bg-gray-100 text-gray-700",
			};
			return (
				<span
					className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}
				>
					{roleConfig.label}
				</span>
			);
		},
	},
	{
		key: "isActive",
		label: "Trạng thái",
		align: "center",
		filterable: true,
		render: (row) =>
			row.isActive ? (
				<StatusBadge label="Hoạt động" type="success" />
			) : (
				<StatusBadge label="Vô hiệu hóa" type="error" />
			),
	},
	{
		key: "createdAt",
		label: "Ngày tạo",
		sortable: true,
		align: "center",
		render: (row) =>
			new Date(row.createdAt).toLocaleDateString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),
	},
];
