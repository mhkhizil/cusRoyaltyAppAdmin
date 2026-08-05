export interface CreateAdminUserDTO {
  nickname: string;
  phone: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateAdminUserRoleDTO {
  role: string;
}

export interface AdminUserResponseDTO {
  id: string;
  nickname: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  isBanned: boolean;
  role: string;
  adminRoleName: string;
  createdAt: string;
  updatedAt: string;
}
