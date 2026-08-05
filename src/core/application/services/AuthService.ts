import { User } from "../../domain/entities/User";
import { IAuthService } from "../../domain/services/IAuthService";
import { ApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Auth Service — admin dashboard login orchestration.
 */
export class AuthService implements IAuthService {
  private authRepository: ApiAuthRepository;

  constructor(authRepository: ApiAuthRepository) {
    this.authRepository = authRepository;
  }

  async login(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error("Email and password are required");
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error("Enter a valid admin email address");
    }

    try {
      const result = await this.authRepository.login(normalizedEmail, password);
      return result.user;
    } catch (error: unknown) {
      console.error("Login failed:", error);
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error("Login failed. Please try again.");
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      console.error("Error retrieving current user:", error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}
