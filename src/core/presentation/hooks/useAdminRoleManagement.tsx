import { useCallback, useState } from "react";
import { AdminRole } from "../../domain/entities/AdminRole";
import { IAdminRoleService } from "../../domain/services/IAdminRoleService";
import { CreateAdminRoleDTO } from "../../application/dtos/AdminRoleDTO";
import container from "../../infrastructure/di/container";

interface UseAdminRoleManagementReturn {
  roles: AdminRole[];
  availablePermissions: string[];
  isLoading: boolean;
  error: string | null;
  loadRoles: () => Promise<void>;
  loadAvailablePermissions: () => Promise<void>;
  createRole: (payload: CreateAdminRoleDTO) => Promise<AdminRole>;
  clearError: () => void;
}

export function useAdminRoleManagement(): UseAdminRoleManagementReturn {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminRoleService =
    container.resolve<IAdminRoleService>("adminRoleService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await adminRoleService.listRoles();
      setRoles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [adminRoleService, clearError]);

  const loadAvailablePermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await adminRoleService.listAvailablePermissions();
      setAvailablePermissions(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load permissions"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [adminRoleService, clearError]);

  const createRole = useCallback(
    async (payload: CreateAdminRoleDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const created = await adminRoleService.createRole(payload);
        setRoles((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create role");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adminRoleService, clearError]
  );

  return {
    roles,
    availablePermissions,
    isLoading,
    error,
    loadRoles,
    loadAvailablePermissions,
    createRole,
    clearError,
  };
}
