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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateMyPasswordDto } from './dto/update-my-password.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtUser } from './interfaces/jwt-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Реєстрація користувача',
    description:
      'Створює нового користувача та надсилає лист із посиланням для активації акаунту.',
  })
  @ApiResponse({ status: 201, description: 'Користувача успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані для реєстрації' })
  @Post('signup')
  signup(@Body() dto: AuthDto, @Req() request: Request) {
    return this.authService.signUp(dto, request);
  }

  @ApiOperation({
    summary: 'Активація акаунту',
    description:
      'Активує акаунт користувача за токеном активації та перенаправляє на сторінку логіну.',
  })
  @ApiParam({
    name: 'token',
    description: 'Токен активації акаунту',
    example: 'a1b2c3d4e5f6...',
  })
  @ApiResponse({ status: 302, description: 'Перенаправлення на сторінку логіну' })
  @Get('activateAccount/:token')
  async activate(@Param('token') token: string, @Res() response: Response) {
    const appUrl =
      this.configService.get<string>('APP_PUBLIC_URL') ??
      process.env.APP_PUBLIC_URL ??
      '';
    const baseUrl = appUrl.replace(/\/+$/, '');

    try {
      await this.authService.activateAccount(token);
      return response.redirect(`${baseUrl}/account/login?activated=1`);
    } catch {
      return response.redirect(`${baseUrl}/account/login?activated=0`);
    }
  }

  @ApiOperation({
    summary: 'Повторне надсилання листа активації',
    description:
      'Повторно генерує токен активації та надсилає користувачу email з посиланням для активації.',
  })
  @ApiResponse({ status: 201, description: 'Лист активації успішно надіслано' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @Post('resendActivationToken')
  resendActivation(@Body() dto: ResendActivationDto, @Req() request: Request) {
    return this.authService.resendActivation(dto, request);
  }

  @ApiOperation({
    summary: 'Вхід у систему',
    description:
      'Автентифікує користувача та повертає токени доступу і оновлення (у cookie та тілі відповіді).',
  })
  @ApiResponse({ status: 201, description: 'Успішний вхід, токени встановлено у cookie' })
  @ApiResponse({ status: 400, description: 'Некоректні дані для входу' })
  @ApiResponse({ status: 401, description: 'Невірний email або пароль' })
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

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Вихід з системи',
    description:
      'Виконує вихід поточного користувача: очищує cookie та інвалідовує поточний refresh токен.',
  })
  @ApiResponse({ status: 200, description: 'Успішний вихід з системи' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
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

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Вихід з усіх пристроїв',
    description:
      'Виконує вихід користувача з усіх активних сесій: очищує cookie та інвалідовує всі refresh токени.',
  })
  @ApiResponse({ status: 200, description: 'Успішний вихід з усіх пристроїв' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
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

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Оновлення токенів',
    description:
      'Використовує refresh токен для генерації нових access та refresh токенів. Токени встановлюються у cookie.',
  })
  @ApiResponse({ status: 201, description: 'Токени успішно оновлені' })
  @ApiResponse({ status: 401, description: 'Некоректний або прострочений refresh токен' })
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

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Отримати поточного користувача',
    description: 'Повертає дані поточного авторизованого користувача.',
  })
  @ApiResponse({ status: 200, description: 'Дані поточного користувача' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @UseGuards(AccessTokenGuard)
  @Get('/me')
  getMe(@CurrentUser() user: JwtUser) {
    const userId = user['sub'];
    return this.usersService.findById(userId);
  }

  @ApiOperation({
    summary: 'Запит на скидання паролю',
    description:
      'Генерує токен для скидання паролю та надсилає користувачу лист з посиланням для встановлення нового паролю.',
  })
  @ApiResponse({ status: 201, description: 'Лист зі скиданням паролю надіслано' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @Post('forgotPassword')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({
    summary: 'Скидання паролю за токеном',
    description:
      'Встановлює новий пароль користувача за наданим токеном скидання паролю.',
  })
  @ApiParam({
    name: 'token',
    description: 'Токен скидання паролю',
    example: 'a1b2c3d4e5f6...',
  })
  @ApiResponse({ status: 200, description: 'Пароль успішно змінено' })
  @ApiResponse({ status: 400, description: 'Некоректний або прострочений токен' })
  @Patch('resetPassword/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Оновлення власного паролю',
    description:
      'Змінює пароль поточного авторизованого користувача. Після зміни видаються нові токени.',
  })
  @ApiResponse({ status: 200, description: 'Пароль успішно оновлено, видано нові токени' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований або невірний поточний пароль' })
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

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Оновлення власного профілю',
    description: 'Оновлює дані профілю поточного авторизованого користувача.',
  })
  @ApiResponse({ status: 200, description: 'Профіль успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані для оновлення' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @UseGuards(AccessTokenGuard)
  @Patch('/updateMe')
  udpateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: JwtUser) {
    const userId = user['sub'];
    return this.usersService.update(userId, dto);
  }
}
