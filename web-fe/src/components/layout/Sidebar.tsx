import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Building2,
	Home,
	CircleDollarSign,
	Users,
	Armchair,
	Store,
	Wrench,
	Vote,
	MessageSquare,
	TrendingUp,
	UserCog,
	UtilityPole,
	User2,
	AlertCircle,
	Receipt,
} from "lucide-react";
import Logo from "@assets/logo.svg";
import { usePermission } from "@/hooks/usePermission";

const Sidebar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { canView } = usePermission();

	const allMenuItems = [
		{ id: "blocks", icon: Building2, label: "Quản lý tòa nhà" },
		{ id: "apartments", icon: Home, label: "Căn hộ" },
		{ id: "invoices", icon: CircleDollarSign, label: "Công nợ" },
		// { id: "fees", icon: Receipt, label: "Phí dịch vụ" },
		{ id: "residents", icon: Users, label: "Cư dân" },
		// { id: "technicians", icon: UtilityPole, label: "Kỹ thuật viên" },
		// { id: "assets", icon: Armchair, label: "Tài sản, thiết bị" },
		// { id: "services", icon: Store, label: "Dịch vụ" },
		// { id: "issues", icon: AlertCircle, label: "Phản ánh, yêu cầu" },
		// { id: "votings", icon: Vote, label: "Biểu quyết" },
		// { id: "maintenances", icon: Wrench, label: "Bảo trì" },
		// { id: "notifications", icon: MessageSquare, label: "Thông báo" },
		// { id: "reports", icon: TrendingUp, label: "Báo cáo thống kê" },
		{ id: "accounts", icon: UserCog, label: "Tài khoản" },
		{ id: "profile", icon: User2, label: "Trang cá nhân" },
	] as const;

	// Lọc menu items dựa trên quyền của user
	const visibleMenuItems = allMenuItems.filter((item) =>
		canView(item.id as any),
	);

	const handleNavigate = (path: string) => {
		navigate(path);
		window.scrollTo({ top: 0, behavior: "instant" });
	};

	return (
		<div className="w-64 bg-main h-screen text-white flex flex-col fixed top-0 left-0 shadow-xl z-50 font-inter overflow-hidden border-r border-main">
			<div className="py-6 flex flex-col items-center shrink-0">
				<div className="mb-2 bg-secondary rounded-md shadow-md flex items-center justify-center">
					<img
						src={Logo}
						alt="Emerald Tower"
						className="w-13 h-13 object-contain"
					/>
				</div>
				<h1 className="font-semibold text-lg text-center tracking-wide">
					Emerald Tower
				</h1>
			</div>

			<div className="mb-2 h-px bg-white/50 shrink-0" />

			<nav className="flex-1 px-3 pb-6 space-y-1 overflow-y-auto custom-scrollbar">
				{visibleMenuItems.map((item) => {
					const Icon = item.icon;
					const isActive = location.pathname.startsWith(`/${item.id}`);

					return (
						<button
							type="button"
							key={item.id}
							onClick={() => handleNavigate(`/${item.id}`)}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group relative ${
								isActive
									? "bg-white text-main font-bold shadow-md"
									: "text-white/90 hover:bg-white/10 hover:text-white"
							}`}
						>
							<Icon
								className={`w-5 h-5 shrink-0 transition-colors ${
									isActive
										? "text-main"
										: "text-white/80 group-hover:text-white"
								}`}
								strokeWidth={isActive ? 2.5 : 2}
							/>
							<span className="text-sm truncate">{item.label}</span>
						</button>
					);
				})}
			</nav>
		</div>
	);
};

export default Sidebar;
