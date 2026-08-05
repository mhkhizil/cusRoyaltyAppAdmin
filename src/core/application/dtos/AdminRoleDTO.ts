export interface CreateAdminRoleDTO {
  name: string;
  description?: string;
  permissions: string[];
}

export interface AdminRoleResponseDTO {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissionsCatalogDTO {
  permissions: string[];
}
