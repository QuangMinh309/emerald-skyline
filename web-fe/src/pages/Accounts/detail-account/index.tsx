"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useGetAccountById } from "@/hooks/data/useAccounts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import UpdateAccountModal from "../update-account";
import DeleteAccountModal from "../delete-account";

const DetailAccount = () => {
	const { accountId } = useParams();
	const navigate = useNavigate();
	const { data: account, isLoading } = useGetAccountById(Number(accountId));

	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const roleMap = {
		ADMIN: "Quản trị viên",
		RESIDENT: "Cư dân",
		TECHNICIAN: "Kỹ thuật viên",
	};

	const roleColorMap = {
		ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
		RESIDENT:
			"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
		TECHNICIAN:
			"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
			</div>
		);
	}

	if (!account) {
		return (
			<div className="flex h-screen flex-col items-center justify-center">
				<h2 className="text-2xl font-semibold">Không tìm thấy tài khoản</h2>
				<Button onClick={() => navigate("/accounts")} className="mt-4">
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/accounts")}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<h1 className="text-3xl font-bold">Chi tiết tài khoản</h1>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsUpdateModalOpen(true)}
						className="gap-2"
					>
						<Pencil className="h-4 w-4" />
						Chỉnh sửa
					</Button>
					<Button
						variant="destructive"
						onClick={() => setIsDeleteModalOpen(true)}
						className="gap-2"
					>
						<Trash2 className="h-4 w-4" />
						Xóa
					</Button>
				</div>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Thông tin tài khoản</CardTitle>
						<CardDescription>
							Thông tin chi tiết về tài khoản trong hệ thống
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">ID</p>
								<p className="text-base font-semibold">{account.id}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Email
								</p>
								<p className="text-base font-semibold">{account.email}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Vai trò
								</p>
								<Badge
									className={`mt-1 ${roleColorMap[account.role as keyof typeof roleColorMap]}`}
								>
									{roleMap[account.role as keyof typeof roleMap]}
								</Badge>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Trạng thái
								</p>
								<Badge
									className={`mt-1 ${
										account.isActive
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
									}`}
								>
									{account.isActive ? "Hoạt động" : "Không hoạt động"}
								</Badge>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Ngày tạo
								</p>
								<p className="text-base">
									{new Date(account.createdAt).toLocaleString("vi-VN")}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Cập nhật lần cuối
								</p>
								<p className="text-base">
									{new Date(account.updatedAt).toLocaleString("vi-VN")}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<UpdateAccountModal
				open={isUpdateModalOpen}
				setOpen={setIsUpdateModalOpen}
				accountId={account.id}
			/>

			<DeleteAccountModal
				open={isDeleteModalOpen}
				setOpen={setIsDeleteModalOpen}
				account={account}
			/>
		</div>
	);
};

export default DetailAccount;
