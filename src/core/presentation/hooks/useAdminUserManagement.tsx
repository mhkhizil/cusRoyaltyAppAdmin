import { useCallback, useState } from "react";
import { AdminUser } from "../../domain/entities/AdminUser";
import { IAdminUserService } from "../../domain/services/IAdminUserService";
import {
  CreateAdminUserDTO,
  UpdateAdminUserRoleDTO,
} from "../../application/dtos/AdminUserDTO";
import container from "../../infrastructure/di/container";

interface UseAdminUserManagementReturn {
  adminUsers: AdminUser[];
  isLoading: boolean;
  error: string | null;
  loadAdminUsers: () => Promise<void>;
  createAdminUser: (payload: CreateAdminUserDTO) => Promise<AdminUser>;
  updateAdminUserRole: (
    userId: string,
    payload: UpdateAdminUserRoleDTO
  ) => Promise<AdminUser>;
  demoteAdminUser: (userId: string) => Promise<AdminUser>;
  clearError: () => void;
}

export function useAdminUserManagement(): UseAdminUserManagementReturn {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminUserService =
    container.resolve<IAdminUserService>("adminUserService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadAdminUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await adminUserService.listAdminUsers();
      setAdminUsers(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin users"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [adminUserService, clearError]);

  const createAdminUser = useCallback(
    async (payload: CreateAdminUserDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const created = await adminUserService.createAdminUser(payload);
        setAdminUsers((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create admin user"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adminUserService, clearError]
  );

  const updateAdminUserRole = useCallback(
    async (userId: string, payload: UpdateAdminUserRoleDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await adminUserService.updateAdminUserRole(
          userId,
          payload
        );
        setAdminUsers((prev) =>
          prev.map((user) => (user.id === userId ? updated : user))
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update admin role"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adminUserService, clearError]
  );

  const demoteAdminUser = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        clearError();
        const demoted = await adminUserService.demoteAdminUser(userId);
        setAdminUsers((prev) => prev.filter((user) => user.id !== userId));
        return demoted;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to demote admin user"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adminUserService, clearError]
  );

  return {
    adminUsers,
    isLoading,
    error,
    loadAdminUsers,
    createAdminUser,
    updateAdminUserRole,
    demoteAdminUser,
    clearError,
  };
}
