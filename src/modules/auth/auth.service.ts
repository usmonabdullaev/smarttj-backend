import { SmsLogPurpose, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { GetProfileResponse } from '@/auth/google/dto/responses/get-profile.response';
import { RequestOtpDto, VerifyOtpDto } from '@/modules/auth/dto/auth.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { generateOtp } from '@/modules/auth/utils/generate-otp';
import { JwtAuthService } from '@/auth/jwt/jwt-auth.service';
import { userSelect } from '@/common/selects/user.select';
import { SmsService } from '@/sms/sms.service';
import {
  LoginMetaDto,
  LoginWithPasswordDto,
} from '@/modules/auth/dto/login-auth.dto';

@Injectable()
export class AuthService {
  private readonly RETRY_DIFFERENCE = 1 * 60 * 1000; // 1 minute
  private readonly EXPIRES_AT = 5 * 60 * 1000; // 5 minute
  private readonly ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtAuthService,
  ) {}

  async googleLogin(
    googleProfile: GetProfileResponse,
    fingerprint: string,
    ip: string,
    userAgent?: string,
  ) {
    const { id } = googleProfile;

    const user = await this.prisma.user.findFirst({
      where: {
        googleId: id,
      },
      select: userSelect,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const session = await this.upsertSession(user.id, {
      fingerprint,
      ip,
      userAgent,
    });

    const token = this.jwtService.sign({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    });

    return { token, user };
  }

  async loginWithPassword(
    dto: LoginWithPasswordDto,
    ip: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.login }, { phone: dto.login }],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login },
      });
    }

    const isValid = await argon2.verify(user.password, dto.password);

    if (!isValid) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login },
      });
    }

    const session = await this.upsertSession(user.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = this.jwtService.sign({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone_role: { phone: dto.phone, role: UserRole.USER } },
      select: { id: true },
    });

    const lastOtp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();

      if (diff < this.RETRY_DIFFERENCE) {
        throw new HttpException(
          {
            message: 'OTP already sent',
            code: 'TOO_MANY_REQUESTS',
            error: {
              phone: dto.phone,
              different: diff,
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

    const code = generateOtp();

    const hash = await argon2.hash(code, { type: argon2.argon2id });

    await this.prisma.authOtp.create({
      data: {
        phone: dto.phone,
        code: hash,
        expiresAt: new Date(Date.now() + this.EXPIRES_AT),
      },
    });

    await this.smsService.send({
      phone: dto.phone,
      message: `Ваш код подтверждения: ${code}`,
      purpose: user ? SmsLogPurpose.LOGIN : SmsLogPurpose.REGISTER,
    });

    return {
      success: true,
      message: `Код подтверждения отправлен на ${dto.phone}, код: ${code}`,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ip: string, userAgent?: string) {
    const otp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException();
    }

    if (otp.expiresAt < new Date()) {
      await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

      throw new BadRequestException({
        message: 'OTP expired',
        code: 'BAD_REQUEST',
        error: dto.phone,
      });
    }

    if (otp.attempts > this.ATTEMPTS) {
      await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

      throw new HttpException(
        {
          message: 'Too many attempts. Please request new OTP',
          code: 'TOO_MANY_REQUESTS',
          error: dto.phone,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await argon2.verify(otp.code, dto.code);

    if (!isValid) {
      await this.prisma.authOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException({
        message: 'Invalid OTP',
        code: 'BAD_REQUEST',
        error: dto.code,
      });
    }

    const user = await this.prisma.user.upsert({
      where: { phone_role: { phone: dto.phone, role: UserRole.USER } },
      create: {
        name: 'Гость',
        phone: dto.phone,
      },
      update: {},
      select: userSelect,
    });

    await this.prisma.authOtp.deleteMany({
      where: { phone: dto.phone },
    });

    const session = await this.upsertSession(user?.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = this.jwtService.sign({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    });

    return { token, user };
  }

  async logout(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async upsertSession(userId: string, meta: LoginMetaDto) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return await this.prisma.session.upsert({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint: meta.fingerprint,
        },
      },
      create: {
        userId,
        fingerprint: meta.fingerprint,
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt,
      },
      update: {
        userAgent: meta.userAgent,
        ip: meta.ip,
        lastActiveAt: new Date(),
        expiresAt,
        isActive: true,
      },
    });
  }
}
