import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="text-center max-w-md">
				<div className="flex justify-center mb-6">
					<div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
						<Lock className="w-10 h-10 text-red-600" />
					</div>
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Truy cập bị từ chối
				</h1>
				<p className="text-gray-600 mb-8">
					Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên
					nếu bạn cho rằng đây là một lỗi.
				</p>

				<div className="space-y-3">
					<Button
						onClick={() => navigate("/profile")}
						className="w-full bg-main hover:bg-main/90"
					>
						Quay về trang chủ
					</Button>
					<Button
						onClick={() => navigate(-1)}
						variant="outline"
						className="w-full"
					>
						Quay lại
					</Button>
				</div>
			</div>
		</div>
	);
}
