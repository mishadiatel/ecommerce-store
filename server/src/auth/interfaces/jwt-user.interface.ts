export interface JwtUser {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  jti: string;
  refreshToken?: string;
}
