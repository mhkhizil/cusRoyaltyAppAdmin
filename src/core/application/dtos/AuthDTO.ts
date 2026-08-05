/**
 * Admin dashboard auth DTOs — match POST /api/v1/admin/dashboard/auth/login
 */

export interface AdminLoginRequestDTO {
  email: string;
  password: string;
}

export interface AdminAccessDTO {
  role: string;
  isRootAdmin: boolean;
  permissions: string[];
}

export interface AdminLoginUserDTO {
  id: string;
  nickname: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  dateOfBirth: string | null;
  referralCode: string | null;
  adminAccess: AdminAccessDTO;
}

export interface AdminLoginTokensDTO {
  accessToken: string;
}

export interface AdminLoginDataDTO {
  user: AdminLoginUserDTO;
  tokens: AdminLoginTokensDTO;
}

export interface ApiEnvelopeDTO<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
  listingDisplayTimezone?: string;
  timestamp?: string;
}
