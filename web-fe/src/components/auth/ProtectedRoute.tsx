import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/common/Spinner";

type ProtectedRouteProps = {
	children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading, user, logout } = useAuth();
	const location = useLocation();
	const notifiedRef = useRef(false);
	const isResident = user?.role === "RESIDENT";

	useEffect(() => {
		if (!isResident) return;
		if (notifiedRef.current) return;
		notifiedRef.current = true;
		toast.error(
			"Tài khoản này là của cư dân. Hãy sử dụng ứng dụng di động để đăng nhập.",
		);
		logout();
	}, [isResident, logout]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Spinner />
			</div>
		);
	}

	if (isResident) {
		return <Navigate to="/login" replace />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
