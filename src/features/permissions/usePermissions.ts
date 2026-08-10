import { useMemo } from "react";
import type { User } from "@/core/domain/entities/User";
import { useAuth } from "@/core/presentation/hooks/useAuth";

/**
 * Permission guards for admin dashboard routes/sidebar.
 * ROOT_ADMIN (`isRootAdmin`) has full access. Staff use `permissions[]`.
 */
const FULL_ACCESS_ROLE = "ROOT_ADMIN";

export const PAGE_PERMISSIONS = {
  dashboard: [] as string[],
  /** Root-admin-only RBAC management */
  adminRoles: ["__ROOT_ADMIN__"] as string[],
  adminUsers: ["__ROOT_ADMIN__"] as string[],
  /** Matches backend "Missing points management permission" */
  points: ["MANAGE_POINTS"] as string[],
  campaigns: ["MANAGE_CAMPAIGNS"] as string[],
  customers: ["MANAGE_CUSTOMERS"],
} as const;

export const PERMISSION_ROUTE_ORDER = [
  { path: "/dashboard", permissions: PAGE_PERMISSIONS.dashboard },
  { path: "/points", permissions: PAGE_PERMISSIONS.points },
  { path: "/campaigns", permissions: PAGE_PERMISSIONS.campaigns },
  { path: "/admin-users", permissions: PAGE_PERMISSIONS.adminUsers },
  { path: "/admin-roles", permissions: PAGE_PERMISSIONS.adminRoles },
  { path: "/customers", permissions: PAGE_PERMISSIONS.customers },
] as const;

const ROOT_ONLY_MARKER = "__ROOT_ADMIN__";

const normalizePermission = (value: string) => value.trim().toUpperCase();

const hasFullAccess = (user: User | null) =>
  user?.hasRootAccess() === true ||
  normalizePermission(String(user?.adminRoleName || "")) === FULL_ACCESS_ROLE;

const extractUserPermissions = (user: User | null): string[] => {
  if (!user || !Array.isArray(user.permissions)) return [];

  return user.permissions
    .filter((value): value is string => typeof value === "string")
    .map(normalizePermission)
    .filter(Boolean);
};

export function usePermissions() {
  const { user } = useAuth();

  const isFullAccess = useMemo(() => hasFullAccess(user), [user]);
  const permissions = useMemo(() => extractUserPermissions(user), [user]);
  const resolvedRoleName = String(
    user?.adminRoleName || user?.role || ""
  ).trim();

  const hasPermission = (requiredPermission: string) => {
    if (requiredPermission === ROOT_ONLY_MARKER) {
      return isFullAccess;
    }
    if (isFullAccess) return true;
    return permissions.includes(normalizePermission(requiredPermission));
  };

  const canAccess = (requiredPermissions?: readonly string[]) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (requiredPermissions.includes(ROOT_ONLY_MARKER)) {
      return isFullAccess;
    }
    if (isFullAccess) return true;
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  return {
    permissions,
    resolvedRoleName,
    isFullAccess,
    isLoading: false,
    hasPermission,
    canAccess,
  };
}
