import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as process from 'node:process';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1️⃣ Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),

        // 2️⃣ Cookies fallback
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (req: Request) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    let refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken && req.cookies?.refreshToken) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      refreshToken = req.cookies.refreshToken;
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...payload, refreshToken };
  }
}
