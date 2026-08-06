import { HttpClient } from "../api/HttpClient";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ApiUserRepository } from "../repositories/ApiUserRepository";
import { ApiAuthRepository } from "../repositories/ApiAuthRepository";
import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { ApiCustomerRepository } from "../repositories/ApiCustomerRepository";
import { IAdminRoleRepository } from "../../domain/repositories/IAdminRoleRepository";
import { ApiAdminRoleRepository } from "../repositories/ApiAdminRoleRepository";
import { IAdminUserRepository } from "../../domain/repositories/IAdminUserRepository";
import { ApiAdminUserRepository } from "../repositories/ApiAdminUserRepository";
import { IPointsRepository } from "../../domain/repositories/IPointsRepository";
import { ApiPointsRepository } from "../repositories/ApiPointsRepository";
import { IBranchRepository } from "../../domain/repositories/IBranchRepository";
import { ApiBranchRepository } from "../repositories/ApiBranchRepository";
import { IAuthService } from "../../domain/services/IAuthService";
import { AuthService } from "../../application/services/AuthService";
import { UserManagementService } from "../../application/services/UserManagementService";
import { CustomerManagementService } from "../../application/services/CustomerManagementService";
import { AdminRoleService } from "../../application/services/AdminRoleService";
import { AdminUserService } from "../../application/services/AdminUserService";
import { PointsService } from "../../application/services/PointsService";
import { BranchService } from "../../application/services/BranchService";
import { ICustomerService } from "../../domain/services/ICustomerService";
import { IUserService } from "../../domain/services/IUserService";
import { IAdminRoleService } from "../../domain/services/IAdminRoleService";
import { IAdminUserService } from "../../domain/services/IAdminUserService";
import { IPointsService } from "../../domain/services/IPointsService";
import { IBranchService } from "../../domain/services/IBranchService";

/**
 * Dependency Injection Container
 * Registers concrete infrastructure/application implementations once.
 */
class Container {
  private instances: Map<string, unknown> = new Map();

  constructor() {
    this.initializeContainer();
  }

  private initializeContainer(): void {
    this.register("httpClient", new HttpClient());

    this.register<IUserRepository>(
      "userRepository",
      new ApiUserRepository(this.resolve("httpClient"))
    );

    this.register<ApiAuthRepository>(
      "authRepository",
      new ApiAuthRepository(this.resolve("httpClient"))
    );

    this.register<ICustomerRepository>(
      "customerRepository",
      new ApiCustomerRepository(this.resolve("httpClient"))
    );

    this.register<IAdminRoleRepository>(
      "adminRoleRepository",
      new ApiAdminRoleRepository(this.resolve("httpClient"))
    );

    this.register<IAdminUserRepository>(
      "adminUserRepository",
      new ApiAdminUserRepository(this.resolve("httpClient"))
    );

    this.register<IPointsRepository>(
      "pointsRepository",
      new ApiPointsRepository(this.resolve("httpClient"))
    );

    this.register<IBranchRepository>(
      "branchRepository",
      new ApiBranchRepository(this.resolve("httpClient"))
    );

    this.register<IAuthService>(
      "authService",
      new AuthService(this.resolve("authRepository"))
    );

    this.register<IUserService>(
      "userService",
      new UserManagementService(this.resolve("userRepository"))
    );

    this.register<ICustomerService>(
      "customerService",
      new CustomerManagementService(this.resolve("customerRepository"))
    );

    this.register<IAdminRoleService>(
      "adminRoleService",
      new AdminRoleService(this.resolve("adminRoleRepository"))
    );

    this.register<IAdminUserService>(
      "adminUserService",
      new AdminUserService(this.resolve("adminUserRepository"))
    );

    this.register<IPointsService>(
      "pointsService",
      new PointsService(this.resolve("pointsRepository"))
    );

    this.register<IBranchService>(
      "branchService",
      new BranchService(this.resolve("branchRepository"))
    );
  }

  register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`No instance registered for key: ${key}`);
    }
    return instance as T;
  }
}

const container = new Container();

export default container;
