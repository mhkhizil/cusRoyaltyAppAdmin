import { AdminRole } from "../../domain/entities/AdminRole";
import { IAdminRoleRepository } from "../../domain/repositories/IAdminRoleRepository";
import { IAdminRoleService } from "../../domain/services/IAdminRoleService";
import { CreateAdminRoleDTO } from "../dtos/AdminRoleDTO";

export class AdminRoleService implements IAdminRoleService {
  constructor(private readonly adminRoleRepository: IAdminRoleRepository) {}

  async listRoles(): Promise<AdminRole[]> {
    return this.adminRoleRepository.listRoles();
  }

  async listAvailablePermissions(): Promise<string[]> {
    return this.adminRoleRepository.listAvailablePermissions();
  }

  async createRole(payload: CreateAdminRoleDTO): Promise<AdminRole> {
    const name = payload.name.trim().toUpperCase();
    if (!name) {
      throw new Error("Role name is required");
    }
    if (name === "ROOT_ADMIN") {
      throw new Error("ROOT_ADMIN cannot be created from the dashboard");
    }
    if (!payload.permissions.length) {
      throw new Error("Select at least one permission");
    }

    return this.adminRoleRepository.createRole({
      name,
      description: payload.description?.trim() || undefined,
      permissions: payload.permissions,
    });
  }
}
