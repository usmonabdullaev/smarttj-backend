import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SmsLogPurpose } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma/prisma.service';
import {
  ConfirmLoginOtpDto,
  LoginMetaDto,
  LoginWithPasswordDto,
  RequestLoginOtpDto,
} from './dto/login-auth.dto';
import {
  ConfirmRegisterDto,
  RequestRegisterOtpDto,
} from './dto/register-auth.dto';
import { generateOtp } from './utils/generate-otp';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async requestRegisterOtp(dto: RequestRegisterOtpDto) {
    const exists = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (exists) {
      throw new ConflictException({
        message: 'User already registered',
        code: 'CONFLICT',
        error: dto.phone,
      });
    }

    const lastOtp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();

      if (diff < 60_000) {
        throw new HttpException(
          {
            message: 'Please wait before requesting new OTP',
            code: 'TOO_MANY_REQUESTS',
            error: dto.phone,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

    const code = generateOtp();

    await this.prisma.authOtp.create({
      data: {
        phone: dto.phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute
      },
    });

    await this.smsService.send({
      phone: dto.phone,
      message: `Ваш код подтверждения: ${code}`,
      purpose: SmsLogPurpose.REGISTER,
    });

    return { success: true, message: 'OTP code sent' };
  }

  async confirmRegisterOtp(
    dto: ConfirmRegisterDto,
    ip: string,
    userAgent?: string,
  ) {
    const exists = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (exists) {
      throw new ConflictException({ message: 'User already registered' });
    }

    const otp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException({ message: 'OTP not found' });
    }

    if (otp.expiresAt < new Date()) {
      await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

      throw new BadRequestException({ message: 'OTP expired' });
    }

    if (otp.attempts >= 5) {
      await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

      throw new HttpException(
        { message: 'Too many attemts. Please request new OTP' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (otp.code !== dto.code) {
      await this.prisma.authOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException({ message: 'Invalid OTP' });
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
      },
    });

    await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

    const session = await this.upsertSession(user.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = jwt.sign(
      { userId: user.id, sessionId: session.id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
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
        error: { login: dto.login, password: dto.password },
      });
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login, password: dto.password },
      });
    }

    const session = await this.upsertSession(user.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = jwt.sign(
      { userId: user.id, sessionId: session.id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async requestLoginOtp(dto: RequestLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { phone: dto.phone },
      });
    }

    const lastOtp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();

      if (diff < 60_000) {
        throw new HttpException(
          {
            message: 'OTP already sent',
            code: 'TOO_MANY_REQUESTS',
            error: dto.phone,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

    const code = generateOtp();

    await this.prisma.authOtp.create({
      data: {
        phone: dto.phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute
      },
    });

    await this.smsService.send({
      phone: dto.phone,
      message: `Ваш код подтверждения: ${code}`,
      purpose: SmsLogPurpose.LOGIN,
    });

    return { success: true, message: 'OTP code sent' };
  }

  async confirmLoginOtp(
    dto: ConfirmLoginOtpDto,
    ip: string,
    userAgent?: string,
  ) {
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

    if (otp.attempts >= 5) {
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

    if (otp.code !== dto.code) {
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

    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new BadRequestException();
    }

    await this.prisma.authOtp.deleteMany({
      where: { phone: dto.phone },
    });

    const session = await this.upsertSession(user?.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = jwt.sign(
      { userId: user.id, sessionId: session.id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async logout(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        error: sessionId,
      });
    }

    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  private async upsertSession(userId: string, meta: LoginMetaDto) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.session.upsert({
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
