import { useAuth } from "@/contexts/AuthContext";
import {
	ROLE_PERMISSIONS,
	type PermissionAction,
	type PermissionModule,
} from "@/constants/permissions";

export const usePermission = () => {
	const { user } = useAuth();

	/**
	 * Kiểm tra user có quyền thực hiện action trên module
	 */
	const hasPermission = (
		module: PermissionModule,
		action: PermissionAction,
	): boolean => {
		if (!user) return false;

		const permissions = ROLE_PERMISSIONS[user.role];
		if (!permissions) return false;

		const modulePermissions = permissions[module];
		return modulePermissions.includes(action);
	};

	/**
	 * Kiểm tra user có thể xem module
	 */
	const canView = (module: PermissionModule): boolean => {
		return hasPermission(module, "view");
	};

	/**
	 * Kiểm tra user có thể tạo module
	 */
	const canCreate = (module: PermissionModule): boolean => {
		return hasPermission(module, "create");
	};

	/**
	 * Kiểm tra user có thể chỉnh sửa module
	 */
	const canUpdate = (module: PermissionModule): boolean => {
		return hasPermission(module, "update");
	};

	/**
	 * Kiểm tra user có thể xóa module
	 */
	const canDelete = (module: PermissionModule): boolean => {
		return hasPermission(module, "delete");
	};

	/**
	 * Kiểm tra user có thể quản lý module (toàn quyền)
	 */
	const canManage = (module: PermissionModule): boolean => {
		return hasPermission(module, "manage");
	};

	/**
	 * Kiểm tra user có bất kỳ quyền nào trên module
	 */
	const hasAnyPermission = (module: PermissionModule): boolean => {
		if (!user) return false;
		const permissions = ROLE_PERMISSIONS[user.role];
		return (permissions[module] ?? []).length > 0;
	};

	return {
		hasPermission,
		canView,
		canCreate,
		canUpdate,
		canDelete,
		canManage,
		hasAnyPermission,
		userRole: user?.role,
	};
};
