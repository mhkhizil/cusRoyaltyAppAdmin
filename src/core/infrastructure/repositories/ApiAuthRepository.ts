import axios from "axios";
import { User } from "../../domain/entities/User";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { isTokenExpired, tokenCookies } from "@/lib/cookies";
import type {
  AdminLoginDataDTO,
  AdminLoginRequestDTO,
  AdminLoginUserDTO,
  ApiEnvelopeDTO,
} from "../../application/dtos/AuthDTO";

/**
 * Admin dashboard auth repository.
 * POST /api/v1/admin/dashboard/auth/login
 */
export class ApiAuthRepository {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    try {
      this.clearPersistedAuthenticatedSession();

      const payload: AdminLoginRequestDTO = {
        email: email.trim().toLowerCase(),
        password,
      };

      const response = await this.httpClient.post<
        ApiEnvelopeDTO<AdminLoginDataDTO>
      >(API_ENDPOINTS.AUTH.LOGIN, payload);

      if (response.success === false) {
        throw new Error(response.message || "Login failed");
      }

      const token = response.data?.tokens?.accessToken;
      if (!token || !token.trim()) {
        throw new Error("Login response did not include an access token");
      }

      const apiUser = response.data?.user;
      if (!apiUser?.id) {
        throw new Error("Login response did not include a user");
      }

      if (!apiUser.adminAccess) {
        throw new Error("Not an admin account");
      }

      const user = this.mapLoginUserToEntity(apiUser, payload.email);
      this.persistAuthenticatedSession(token, user);

      return { user, token };
    } catch (error: unknown) {
      console.error("Error during login:", error);

      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (msg) throw new Error(String(msg));
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Invalid credentials");
    }
  }

  async logout(): Promise<void> {
    try {
      this.httpClient.clearCsrfToken();
      this.clearPersistedAuthenticatedSession();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = tokenCookies.getToken();
      const userJson = tokenCookies.getUser();
      if (!token || !userJson) {
        tokenCookies.clearAll();
        return null;
      }

      if (isTokenExpired(token)) {
        this.clearPersistedAuthenticatedSession();
        return null;
      }

      const userData = JSON.parse(userJson) as Record<string, unknown>;
      return this.mapStoredUserToEntity(userData);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  private persistAuthenticatedSession(token: string, user: User): void {
    sessionStorage.setItem("wms_token", token);
    sessionStorage.setItem("wms_user", JSON.stringify(user));
    tokenCookies.setToken(token);
    tokenCookies.setUser(JSON.stringify(user));
  }

  private clearPersistedAuthenticatedSession(): void {
    sessionStorage.removeItem("wms_token");
    sessionStorage.removeItem("wms_user");
    tokenCookies.clearAll();
  }

  private mapLoginUserToEntity(
    apiUser: AdminLoginUserDTO,
    fallbackEmail: string
  ): User {
    const roleName = String(apiUser.adminAccess?.role || "").trim();
    const isRootAdmin = apiUser.adminAccess?.isRootAdmin === true;
    const permissions = this.normalizePermissions(
      apiUser.adminAccess?.permissions ?? []
    );
    const email =
      typeof apiUser.email === "string" && apiUser.email.trim()
        ? apiUser.email.trim()
        : fallbackEmail;

    return new User({
      id: String(apiUser.id),
      name: apiUser.nickname || email,
      nickname: apiUser.nickname || "",
      email,
      phone: apiUser.phone,
      role: isRootAdmin || roleName.toUpperCase() === "ROOT_ADMIN" ? "ADMIN" : "STAFF",
      adminRoleName: roleName || undefined,
      isRootAdmin,
      permissions,
      profileImageUrl:
        typeof apiUser.avatar === "string" ? apiUser.avatar : undefined,
    });
  }

  private mapStoredUserToEntity(data: Record<string, unknown>): User {
    const permissions = this.normalizePermissions(data.permissions);
    const adminRoleName = String(data.adminRoleName || "").trim();
    const isRootAdmin =
      data.isRootAdmin === true ||
      adminRoleName.toUpperCase() === "ROOT_ADMIN";

    return new User({
      id: String(data.id || ""),
      name: String(data.name || data.nickname || ""),
      nickname: String(data.nickname || data.name || ""),
      email: String(data.email || ""),
      phone: data.phone ? String(data.phone) : undefined,
      role: data.role === "ADMIN" || isRootAdmin ? "ADMIN" : "STAFF",
      adminRoleId: data.adminRoleId ? String(data.adminRoleId) : undefined,
      adminRoleName: adminRoleName || undefined,
      isRootAdmin,
      permissions,
      isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      isBanned: typeof data.isBanned === "boolean" ? data.isBanned : undefined,
      profileImageUrl: data.profileImageUrl
        ? String(data.profileImageUrl)
        : undefined,
      createdDate: data.createdDate
        ? new Date(String(data.createdDate))
        : undefined,
      updatedDate: data.updatedDate
        ? new Date(String(data.updatedDate))
        : undefined,
    });
  }

  private normalizePermissions(rawPermissions: unknown): string[] {
    if (!Array.isArray(rawPermissions)) return [];

    return rawPermissions
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          const permission = entry as Record<string, unknown>;
          return String(
            permission.key || permission.name || permission.id || ""
          ).trim();
        }
        return "";
      })
      .filter(Boolean);
  }
}
