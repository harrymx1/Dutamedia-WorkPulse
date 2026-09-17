export type Role =
  | 'Employee'
  | 'Supervisor_TL'
  | 'Head'
  | 'Head_Dept'
  | 'PM'
  | 'HRGA'
  | 'CEO_Management'
  | 'CEO_Director'
  | 'SystemAdmin';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role | null;
  function: string | null;
  directManagerId: string | null;
  mustResetPassword: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthUser;
}

export interface ResetPasswordPayload {
  oldPassword?: string;
  newPassword: string;
}
