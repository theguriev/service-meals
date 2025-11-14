import { isArray } from "es-toolkit/compat";

const permissions = {
	admin: permissionAdmin,
	manager: permissionManager,
	"template-manager": permissionTemplateManager,
} as const;

export const can = (
	user: Awaited<ReturnType<typeof getInitialUser>>,
	permission: string | string[],
) => {
	const { role, permissions: userPermissions } = user;
	const rolePermissions = permissions[role || "user"] ?? [];
	const allPermissions = [...userPermissions, ...rolePermissions];

	return isArray(permission)
		? allPermissions.some((p) => permission.includes(p))
		: allPermissions.includes(permission);
};

export default permissions;
