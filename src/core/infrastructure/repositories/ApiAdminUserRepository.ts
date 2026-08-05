import axios from "axios";
import { AdminUser } from "../../domain/entities/AdminUser";
import { IAdminUserRepository } from "../../domain/repositories/IAdminUserRepository";
import {
  AdminUserResponseDTO,
  CreateAdminUserDTO,
  UpdateAdminUserRoleDTO,
} from "../../application/dtos/AdminUserDTO";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function mapAdminUser(dto: AdminUserResponseDTO): AdminUser {
  const email =
    typeof dto.email === "string" && dto.email.trim() ? dto.email.trim() : "";

  return new AdminUser({
    id: String(dto.id),
    nickname: String(dto.nickname || ""),
    phone: String(dto.phone || ""),
    email,
    isActive: Boolean(dto.isActive),
    isBanned: Boolean(dto.isBanned),
    role: String(dto.role || ""),
    adminRoleName: String(dto.adminRoleName || dto.role || ""),
    createdAt: String(dto.createdAt || new Date().toISOString()),
    updatedAt: String(dto.updatedAt || new Date().toISOString()),
  });
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg) return String(msg);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export class ApiAdminUserRepository implements IAdminUserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<AdminUserResponseDTO[]>
      >(API_ENDPOINTS.ADMIN_USERS.BASE);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load admin users");
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      return rows.map(mapAdminUser);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load admin users"));
    }
  }

  async createAdminUser(payload: CreateAdminUserDTO): Promise<AdminUser> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<AdminUserResponseDTO>
      >(API_ENDPOINTS.ADMIN_USERS.BASE, payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to create admin user");
      }

      return mapAdminUser(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create admin user"));
    }
  }

  async updateAdminUserRole(
    userId: string,
    payload: UpdateAdminUserRoleDTO
  ): Promise<AdminUser> {
    try {
      const response = await this.httpClient.patch<
        ApiEnvelopeDTO<AdminUserResponseDTO>
      >(API_ENDPOINTS.ADMIN_USERS.UPDATE_ROLE(userId), payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to update admin role");
      }

      return mapAdminUser(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to update admin role"));
    }
  }

  async demoteAdminUser(userId: string): Promise<AdminUser> {
    try {
      const response = await this.httpClient.delete<
        ApiEnvelopeDTO<AdminUserResponseDTO>
      >(API_ENDPOINTS.ADMIN_USERS.REMOVE_ROLE(userId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to demote admin user");
      }

      return mapAdminUser(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to demote admin user"));
    }
  }
}
