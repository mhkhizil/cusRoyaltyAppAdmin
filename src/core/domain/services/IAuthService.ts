import { User } from "../entities/User";

/**
 * Admin dashboard authentication service contract.
 * Login is email + password only (not client phone login).
 */
export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}
