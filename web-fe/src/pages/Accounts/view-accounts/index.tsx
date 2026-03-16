import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import CustomTable from "@/components/common/CustomTable";
import { SearchBar } from "@/components/common/SearchBar";

import { accountColumns } from "./columns";
import { normalizeString } from "@/utils/string";
import { useAccounts } from "@/hooks/data/useAccounts";
import CreateAccountModal from "@/pages/Accounts/create-account";
import DeleteAccount from "@/pages/Accounts/delete-account";
import DeleteManyAccountsModal from "@/pages/Accounts/multiple-delete-accounts";
import type { Account } from "@/types/account";
import UpdateAccountModal from "@/pages/Accounts/update-account";
import { useNavigate } from "react-router-dom";

const AccountsPage = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const [isNewModalOpen, setNewIsModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletedAccount, setDeletedAccount] = useState<Account>();
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [updatedAccount, setUpdatedAccount] = useState<number>();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);

	const {
		data: accounts = [],
		isLoading: isAccountsLoading,
		isError: isAccountsError,
		error: accountsError,
		refetch: refetchAccounts,
	} = useAccounts();

	const filteredAccounts = useMemo(() => {
		let result = [...accounts];

		if (searchTerm.trim()) {
			const search = normalizeString(searchTerm);
			result = result.filter((item) =>
				normalizeString(item.email).includes(search),
			);
		}

		return result;
	}, [accounts, searchTerm]);

	return (
		<>
			<div className="p-1.5 pt-0 space-y-4 print:hidden">
				<PageHeader
					title="Tài khoản"
					subtitle="Quản lý tài khoản người dùng trong hệ thống"
					actions={
						<div className="flex items-center gap-2">
							{selectedIds.length > 0 ? (
								<button
									onClick={() => setIsDeleteManyOpen(true)}
									className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium animate-in fade-in zoom-in-95 shadow-sm"
								>
									<Trash2 className="w-4 h-4" />
									Xóa ({selectedIds.length})
								</button>
							) : (
								<button
									onClick={() => setNewIsModalOpen(true)}
									className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium"
								>
									<Plus className="w-4 h-4" />
									Tạo tài khoản
								</button>
							)}
						</div>
					}
				/>

				{/* Khu vực lọc & tìm kiếm */}
				<div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm space-y-4">
					<SearchBar
						placeholder="Tìm kiếm theo email..."
						onSearch={setSearchTerm}
					/>
				</div>

				{/* Hiển thị nội dung chính */}
				<div className="min-h-[400px]">
					{isAccountsLoading ? (
						<div className="bg-white p-12 text-center text-gray-500 border rounded shadow-sm">
							Đang tải dữ liệu tài khoản...
						</div>
					) : isAccountsError ? (
						<div className="bg-red-50 border border-red-200 p-8 rounded text-center space-y-3 text-red-600">
							<p className="font-medium">Không thể tải dữ liệu!</p>
							<p className="text-sm">{(accountsError as Error)?.message}</p>
							<button
								onClick={() => refetchAccounts()}
								className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
							>
								Thử lại ngay
							</button>
						</div>
					) : (
						<CustomTable
							data={filteredAccounts}
							columns={accountColumns}
							defaultPageSize={10}
							onSelectionChange={setSelectedIds}
							selection={selectedIds}
							onEdit={(row) => {
								setIsUpdateOpen(true);
								setUpdatedAccount((row as Account).id);
							}}
							onDelete={(row) => {
								setIsDeleteOpen(true);
								setDeletedAccount(row as Account);
							}}
							onView={(row) => navigate(`/accounts/${row.id}`)}
						/>
					)}
				</div>
			</div>

			<CreateAccountModal open={isNewModalOpen} setOpen={setNewIsModalOpen} />
			<DeleteAccount
				account={deletedAccount}
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
			/>
			<UpdateAccountModal
				open={isUpdateOpen}
				setOpen={setIsUpdateOpen}
				accountId={updatedAccount!}
			/>
			<DeleteManyAccountsModal
				open={isDeleteManyOpen}
				setOpen={setIsDeleteManyOpen}
				accountIds={selectedIds}
				onSuccess={() => setSelectedIds([])}
			/>
		</>
	);
};

export default AccountsPage;
