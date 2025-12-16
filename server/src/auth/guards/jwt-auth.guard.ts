import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { JwtUser } from '../interfaces/jwt-user.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const accessToken = req.cookies?.accessToken as string | undefined;
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    // 1️⃣ Try access token
    if (accessToken) {
      try {
        const payload: JwtUser = await this.jwtService.verifyAsync(
          accessToken,
          {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
          },
        );

        req.user = payload;
        return true;
      } catch {
        // expired → go to refresh
      }
    }

    // 2️⃣ Try refresh token
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    let refreshPayload: JwtUser;
    try {
      refreshPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findByIdFullFields(refreshPayload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshMatches) {
      throw new UnauthorizedException();
    }

    // 3️⃣ Issue new access token
    const newAccessToken = await this.jwtService.signAsync(
      {
        sub: String(user._id),
        username: user.email,
        role: user.role,
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    const newRefreshToken = await this.jwtService.signAsync(
      {
        sub: String(user._id),
        username: user.email,
        role: user.role,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    // Хешуємо і зберігаємо новий refresh token у БД
    await this.authService.updateRefreshToken(
      String(user._id),
      newRefreshToken,
    );

    // Встановлюємо новий refreshToken в cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    req.user = {
      sub: String(user._id),
      username: user.email,
      role: user.role,
    };

    return true;
  }
}
