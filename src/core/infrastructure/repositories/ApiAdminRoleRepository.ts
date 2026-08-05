import axios from "axios";
import { AdminRole } from "../../domain/entities/AdminRole";
import { IAdminRoleRepository } from "../../domain/repositories/IAdminRoleRepository";
import {
  AdminPermissionsCatalogDTO,
  AdminRoleResponseDTO,
  CreateAdminRoleDTO,
} from "../../application/dtos/AdminRoleDTO";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function mapRole(dto: AdminRoleResponseDTO): AdminRole {
  return new AdminRole({
    id: String(dto.id),
    name: String(dto.name),
    description: nullableString(dto.description),
    isSystem: Boolean(dto.isSystem),
    permissions: Array.isArray(dto.permissions)
      ? dto.permissions.map(String)
      : [],
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

export class ApiAdminRoleRepository implements IAdminRoleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listRoles(): Promise<AdminRole[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<AdminRoleResponseDTO[]>
      >(API_ENDPOINTS.ADMIN_ROLES.BASE);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load admin roles");
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      return rows.map(mapRole);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load admin roles"));
    }
  }

  async listAvailablePermissions(): Promise<string[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<AdminPermissionsCatalogDTO>
      >(API_ENDPOINTS.ADMIN_ROLES.PERMISSIONS);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load permissions");
      }

      const permissions = response.data?.permissions;
      return Array.isArray(permissions) ? permissions.map(String) : [];
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load permissions"));
    }
  }

  async createRole(payload: CreateAdminRoleDTO): Promise<AdminRole> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<AdminRoleResponseDTO>
      >(API_ENDPOINTS.ADMIN_ROLES.BASE, payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to create admin role");
      }

      return mapRole(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create admin role"));
    }
  }
}
