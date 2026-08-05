import { AdminUser } from "../entities/AdminUser";
import {
  CreateAdminUserDTO,
  UpdateAdminUserRoleDTO,
} from "../../application/dtos/AdminUserDTO";

export interface IAdminUserRepository {
  listAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(payload: CreateAdminUserDTO): Promise<AdminUser>;
  updateAdminUserRole(
    userId: string,
    payload: UpdateAdminUserRoleDTO
  ): Promise<AdminUser>;
  demoteAdminUser(userId: string): Promise<AdminUser>;
}
