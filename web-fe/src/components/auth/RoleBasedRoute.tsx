import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

type RoleBasedRouteProps = {
	children: ReactNode;
	allowedRoles: UserRole[];
	fallbackPath?: string;
};

/**
 * Component để kiểm soát truy cập dựa trên role
 * @param children - Content để render nếu user có quyền
 * @param allowedRoles - Danh sách role được phép truy cập
 * @param fallbackPath - Đường dẫn redirect nếu không có quyền (mặc định: /unauthorized)
 */
const RoleBasedRoute = ({
	children,
	allowedRoles,
	fallbackPath = "/unauthorized",
}: RoleBasedRouteProps) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (!allowedRoles.includes(user.role)) {
		return <Navigate to={fallbackPath} replace />;
	}

	return <>{children}</>;
};

export default RoleBasedRoute;
