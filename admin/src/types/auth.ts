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
  password: string
}