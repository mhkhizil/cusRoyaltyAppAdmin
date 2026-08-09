import { AdminUser } from "../../domain/entities/AdminUser";
import { IAdminUserRepository } from "../../domain/repositories/IAdminUserRepository";
import { IAdminUserService } from "../../domain/services/IAdminUserService";
import {
  CreateAdminUserDTO,
  UpdateAdminUserRoleDTO,
} from "../dtos/AdminUserDTO";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AdminUserService implements IAdminUserService {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async listAdminUsers(): Promise<AdminUser[]> {
    return this.adminUserRepository.listAdminUsers();
  }

  async createAdminUser(payload: CreateAdminUserDTO): Promise<AdminUser> {
    const nickname = payload.nickname.trim();
    const phone = payload.phone.trim();
    const email = payload.email.trim().toLowerCase();
    const role = payload.role.trim();

    if (!nickname || !phone || !email || !payload.password || !role) {
      throw new Error("All fields are required to create an admin user");
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new Error("Enter a valid email address");
    }
    if (payload.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (role.toUpperCase() === "ROOT_ADMIN") {
      throw new Error("ROOT_ADMIN cannot be assigned");
    }

    return this.adminUserRepository.createAdminUser({
      nickname,
      phone,
      email,
      password: payload.password,
      role,
    });
  }

  async updateAdminUserRole(
    userId: string,
    payload: UpdateAdminUserRoleDTO
  ): Promise<AdminUser> {
    const role = payload.role.trim();
    if (!userId.trim()) {
      throw new Error("User id is required");
    }
    if (!role) {
      throw new Error("Role is required");
    }
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === "ROOT_ADMIN" || normalizedRole === "USER") {
      throw new Error("ROOT_ADMIN and USER roles cannot be assigned");
    }

    return this.adminUserRepository.updateAdminUserRole(userId, { role });
  }

  async revokeAdminAccess(userId: string): Promise<AdminUser> {
    if (!userId.trim()) {
      throw new Error("User id is required");
    }
    return this.adminUserRepository.revokeAdminAccess(userId);
  }

  async reactivateAdminUser(userId: string): Promise<AdminUser> {
    if (!userId.trim()) {
      throw new Error("User id is required");
    }
    return this.adminUserRepository.reactivateAdminUser(userId);
  }
}
