export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "",
} as const;

/**
 * Template endpoint map.
 * Replace paths with your backend contract when starting a new project.
 */
export const API_ENDPOINTS = {
  ROOT: "/",

  AUTH: {
    LOGIN: "/api/v1/admin/dashboard/auth/login",
  },

  ADMIN_ROLES: {
    BASE: "/api/v1/admin/dashboard/admin-roles",
    PERMISSIONS: "/api/v1/admin/dashboard/admin-roles/permissions",
  },

  ADMIN_USERS: {
    BASE: "/api/v1/admin/dashboard/admin-users",
    UPDATE_ROLE: (userId: string) =>
      `/api/v1/admin/dashboard/admin-users/${userId}/role`,
    REMOVE_ROLE: (userId: string) =>
      `/api/v1/admin/dashboard/admin-users/${userId}/role`,
  },

  POINTS: {
    QR_SCAN: "/api/v1/admin/dashboard/points/qr-scan",
    RULES: "/api/v1/admin/dashboard/points/rules",
  },

  OPS: {
    BRANCHES: "/api/v1/admin/dashboard/ops/branches",
  },

  // Legacy template stubs (kept for unused UserManagementService wiring)
  USERS: {
    BASE: "/api/v1/users",
    CREATE: "/api/v1/users",
    GET_BY_ID: "/api/v1/users/by-id",
    GET_LIST: "/api/v1/users",
    UPDATE: "/api/v1/users/update",
    UPDATE_PROFILE: "/api/v1/users/profile",
    UPLOAD_PROFILE_IMAGE: "/api/v1/users/upload-profile-image",
    DELETE: (id: string) => `/api/v1/users/${id}`,
  },

  // Example resource — copy this pattern for new features
  CUSTOMERS: {
    BASE: "/api/v1/customers",
    CREATE: "/api/v1/customers",
    GET_ALL: "/api/v1/customers",
    GET_ALL_NO_PAGINATION: "/api/v1/customers/all",
    GET_BY_ID: (id: string) => `/api/v1/customers/${id}`,
    UPDATE: (id: string) => `/api/v1/customers/${id}`,
    DELETE: (id: string) => `/api/v1/customers/${id}`,
    GET_BY_EMAIL: (email: string) => `/api/v1/customers/email/${email}`,
    GET_BY_PHONE: (phone: string) => `/api/v1/customers/phone/${phone}`,
  },

  CSRF: {
    TOKEN: "/csrf/token",
  },
} as const;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS;
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
