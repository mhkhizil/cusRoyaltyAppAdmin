/**
 * Authenticated admin user domain entity.
 * Populated from admin dashboard login (`adminAccess`) and admin-users list responses.
 */
export class User {
  id!: string;
  name!: string;
  email!: string;
  phone?: string;
  role!: "ADMIN" | "STAFF";
  nickname?: string;
  adminRoleId?: string;
  adminRoleName?: string;
  isRootAdmin?: boolean;
  permissions?: string[];
  isActive?: boolean;
  isBanned?: boolean;
  profileImageUrl?: string;
  createdDate?: Date;
  updatedDate?: Date;

  [key: string]: unknown;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "ADMIN" | "STAFF";
    nickname?: string;
    adminRoleId?: string;
    adminRoleName?: string;
    isRootAdmin?: boolean;
    permissions?: string[];
    isActive?: boolean;
    isBanned?: boolean;
    profileImageUrl?: string;
    createdDate?: Date;
    updatedDate?: Date;
  }) {
    Object.assign(this, data);
  }

  isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      !!this.id &&
      !!this.name &&
      !!this.email &&
      emailRegex.test(this.email) &&
      !!this.role &&
      ["ADMIN", "STAFF"].includes(this.role)
    );
  }

  isAdmin(): boolean {
    return this.role === "ADMIN" || this.isRootAdmin === true;
  }

  isStaff(): boolean {
    return this.role === "STAFF" && this.isRootAdmin !== true;
  }

  hasRootAccess(): boolean {
    return (
      this.isRootAdmin === true ||
      String(this.adminRoleName || "").toUpperCase() === "ROOT_ADMIN"
    );
  }
}
