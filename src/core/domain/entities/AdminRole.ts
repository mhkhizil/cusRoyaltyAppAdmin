export interface AdminRoleData {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin role entity — permission set managed by ROOT_ADMIN.
 */
export class AdminRole {
  public id: string;
  public name: string;
  public description: string | null;
  public isSystem: boolean;
  public permissions: string[];
  public createdAt: string;
  public updatedAt: string;

  constructor(data: AdminRoleData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isSystem = data.isSystem;
    this.permissions = [...data.permissions];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isRootSystemRole(): boolean {
    return this.isSystem && this.name.toUpperCase() === "ROOT_ADMIN";
  }
}
