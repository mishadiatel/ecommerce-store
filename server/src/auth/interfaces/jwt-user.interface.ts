export interface JwtUser {
  sub: string;
  username: string;
  role: 'user' | 'admin';
  refreshToken?: string;
}
