import { AdminUser } from "../entities/AdminUser";
import {
  CreateAdminUserDTO,
  UpdateAdminUserRoleDTO,
} from "../../application/dtos/AdminUserDTO";

export interface IAdminUserService {
  listAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(payload: CreateAdminUserDTO): Promise<AdminUser>;
  updateAdminUserRole(
    userId: string,
    payload: UpdateAdminUserRoleDTO
  ): Promise<AdminUser>;
  revokeAdminAccess(userId: string): Promise<AdminUser>;
  reactivateAdminUser(userId: string): Promise<AdminUser>;
}
