import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import type {
	PermissionAction,
	PermissionModule,
} from "@/constants/permissions";

type ModuleAccessGuardProps = {
	module: PermissionModule;
	action?: PermissionAction;
	fallback?: ReactNode;
	children: ReactNode;
};

/**
 * Component để hiển thị content chỉ khi user có quyền
 * @param module - Module cần kiểm tra quyền
 * @param action - Action cần kiểm tra (mặc định: "view")
 * @param fallback - Content hiển thị nếu không có quyền
 * @param children - Content hiển thị nếu có quyền
 */
const ModuleAccessGuard = ({
	module,
	action = "view",
	fallback = null,
	children,
}: ModuleAccessGuardProps) => {
	const { hasPermission } = usePermission();

	if (!hasPermission(module, action)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

export default ModuleAccessGuard;
