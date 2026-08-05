export interface AdminUserData {
  id: string;
  nickname: string;
  phone: string;
  email: string;
  isActive: boolean;
  isBanned: boolean;
  role: string;
  adminRoleName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin staff user listed/managed by ROOT_ADMIN.
 */
export class AdminUser {
  public id: string;
  public nickname: string;
  public phone: string;
  public email: string;
  public isActive: boolean;
  public isBanned: boolean;
  public role: string;
  public adminRoleName: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(data: AdminUserData) {
    this.id = data.id;
    this.nickname = data.nickname;
    this.phone = data.phone;
    this.email = data.email;
    this.isActive = data.isActive;
    this.isBanned = data.isBanned;
    this.role = data.role;
    this.adminRoleName = data.adminRoleName;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isRootAdmin(): boolean {
    const name = (this.adminRoleName || this.role).toUpperCase();
    return name === "ROOT_ADMIN";
  }
}
