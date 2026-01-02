import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { safeUser } from '../utils/safe-user';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateMyPasswordDto } from './dto/update-my-password.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtUser } from './interfaces/jwt-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(dto: AuthDto) {
    // Check if user exists
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(dto.password);
    const newUser = await this.usersService.create({
      ...dto,
      password: hash,
      activationToken: crypto.randomUUID(),
    });

    if (!newUser) {
      throw new HttpException(
        'problem with creating new user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { activationToken: newUser.activationToken };
  }

  async activateAccount(token: string) {
    const user = await this.usersService.findByActivationToken(token);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    user.isActivated = true;
    user.activationToken = undefined;
    await user.save();
    return {
      message: 'user activated successfully please login',
    };
  }

  async resendActivation(dto: ResendActivationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    user.activationToken = crypto.randomUUID();
    await user.save();
    return { activationToken: user.activationToken };
  }

  async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.usersService.findByEmailFullFields(data.email);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    if (!user.isActivated) {
      throw new HttpException(
        'user not activated chack you email anc activate user',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tokens = await this.getTokens(
      String(user._id),
      user.email,
      user.role,
    );
    await this.addSession(user, tokens.refreshToken, tokens.jti);
    return { tokens, userData: safeUser(user) };
  }

  async addSession(user: UserDocument, refreshToken: string, jti: string) {
    const hash = await bcrypt.hash(refreshToken, 12);

    user.sessions.push({
      jti,
      refreshTokenHash: hash,
      userAgent: 'TODO',
      ip: 'TODO',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await user.save();
  }

  async logout(userId: string, jti: string) {
    await this.usersService.update(userId, {
      $pull: { sessions: { jti } },
    });
  }

  async logoutAll(userId: string) {
    await this.usersService.update(userId, {
      sessions: [],
    });
  }

  hashData(data: string) {
    return bcrypt.hash(data, 12);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string, role: string) {
    const refreshJti = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          jti: refreshJti,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
          jti: refreshJti,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      jti: refreshJti,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdFullFields(userId);
    if (!user) throw new ForbiddenException('Access Denied');

    const payload: JwtUser = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    const session = user.sessions.find((s) => s.jti === payload.jti);
    if (!session) throw new ForbiddenException('Session not found');

    const ok = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!ok) throw new ForbiddenException('Token mismatch');

    // issue new tokens
    const {
      accessToken,
      refreshToken: newRT,
      jti,
    } = await this.getTokens(userId, user.email, user.role);

    // remove old session
    user.sessions = user.sessions.filter((s) => s.jti !== payload.jti);

    // add new
    await this.addSession(user, newRT, jti);

    return {
      tokens: { accessToken, refreshToken: newRT },
      userData: safeUser(user),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmailFullFields(dto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: true });

    try {
      // const resetURL = `${process.env.FRNTEND_URL}/${resetToken}`;
      // await new Email(user, resetURL).sendPasswordReset();
      return {
        resetToken,
      };
    } catch (err) {
      console.error(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new HttpException(
        'errot sending reset link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);
    if (!user) {
      throw new HttpException(
        'reset link is invalid or get expired, try arain',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await this.hashData(dto.password);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return {
      message: 'Password updated successfully',
    };
  }

  async updateMyPassword(id: string, dto: UpdateMyPasswordDto) {
    const user = await this.usersService.findByIdFullFields(id);
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new HttpException(
        'Current password is wrong',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashesPassword = await this.hashData(dto.newPassword);
    user.password = hashesPassword;
    await user.save();
    const tokens = await this.getTokens(
      String(user._id),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(String(user._id), tokens.refreshToken);
    return { tokens, userData: safeUser(user) };
  }
}
