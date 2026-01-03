import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import * as process from 'node:process';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateMyPasswordDto } from './dto/update-my-password.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtUser } from './interfaces/jwt-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() dto: AuthDto, @Req() request: Request) {
    return this.authService.signUp(dto, request);
  }

  @Get('activateAccount/:token')
  activate(@Param('token') token: string) {
    return this.authService.activateAccount(token);
  }

  @Post('resendActivationToken')
  resendActivation(@Body() dto: ResendActivationDto, @Req() request: Request) {
    return this.authService.resendActivation(dto, request);
  }

  @Post('signin')
  async signin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.signIn(dto);
    const {
      tokens: { accessToken, refreshToken },
      userData,
    } = data;
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return {
      accessToken,
      userData,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: JwtUser,
  ) {
    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');
    return this.authService.logout(user['sub'], String(user.jti));
  }

  @UseGuards(AccessTokenGuard)
  @Get('logoutAll')
  logoutAll(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: JwtUser,
  ) {
    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');
    return this.authService.logoutAll(user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: JwtUser,
  ) {
    const userId = user['sub'];
    const userRefreshToken = user['refreshToken']!;
    const data = await this.authService.refreshTokens(userId, userRefreshToken);
    const {
      tokens: { accessToken, refreshToken },
      userData,
    } = data;
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return {
      accessToken,
      userData,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  getMe(@CurrentUser() user: JwtUser) {
    const userId = user['sub'];
    return this.usersService.findById(userId);
  }

  @Post('forgotPassword')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Patch('resetPassword/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/updateMyPassword')
  async updateMyPassword(
    @Body() dto: UpdateMyPasswordDto,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: JwtUser,
  ) {
    const userId = user['sub'];
    const data = await this.authService.updateMyPassword(String(userId), dto);
    const {
      tokens: { accessToken, refreshToken },
      userData,
    } = data;
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000),
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return {
      accessToken,
      userData,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/updateMe')
  udpateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: JwtUser) {
    const userId = user['sub'];
    return this.usersService.update(userId, dto);
  }
}
