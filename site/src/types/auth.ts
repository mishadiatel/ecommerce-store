export interface User {
  _id: string,
  firstName?: string,
  lastName?: string,
  birthDay?: string,
  phoneNumber?: string,
  isActivated: boolean,
  email: string,
  role: string,
}

export interface LoginResponse {
  accessToken: string
  userData: User
}

export interface LoginRequestData {
  email: string;
  password: string;
}

export interface SignupRequestData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  password: string;
}

export interface UpdateMeRequestData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDay?: string;
  email?: string;
}

export interface UpdatePasswordRequestData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestData {
  email: string;
}

export interface ResetPasswordRequestData {
  password: string;
}

export interface ResendActivationRequestData {
  email: string;
}
