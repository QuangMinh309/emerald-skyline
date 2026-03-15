import type React from "react";
import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Spinner from "@components/common/Spinner";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate("/login", { replace: true });
	};

	const userName = user?.email?.split("@")[0] || "User";
	const userEmail = user?.email || "";

	return (
		<div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
			<div className="print:hidden">
				<Sidebar />
			</div>

			<div className="print:hidden">
				<Header
					userName={userName}
					userEmail={userEmail}
					onLogout={handleLogout}
				/>
			</div>

			<main className="ml-64 mt-16 p-8 flex-1 transition-all duration-300 print:m-0 print:p-0 print:overflow-visible">
				<div className="max-w-[1600px] mx-auto print:max-w-none print:w-full">
					<Suspense
						fallback={
							<div className="w-full h-[calc(100vh-100px)] flex items-center justify-center print:hidden">
								<Spinner />
							</div>
						}
					>
						<Outlet />
					</Suspense>
				</div>
			</main>
		</div>
	);
};

export default MainLayout;
