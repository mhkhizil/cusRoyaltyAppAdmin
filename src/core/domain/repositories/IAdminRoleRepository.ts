import { AdminRole } from "../entities/AdminRole";
import { CreateAdminRoleDTO } from "../../application/dtos/AdminRoleDTO";

export interface IAdminRoleRepository {
  listRoles(): Promise<AdminRole[]>;
  listAvailablePermissions(): Promise<string[]>;
  createRole(payload: CreateAdminRoleDTO): Promise<AdminRole>;
}
