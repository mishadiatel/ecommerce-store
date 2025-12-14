import { JwtUser } from '../auth/interfaces/jwt-user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}
