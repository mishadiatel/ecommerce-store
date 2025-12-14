import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (req: Request) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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
