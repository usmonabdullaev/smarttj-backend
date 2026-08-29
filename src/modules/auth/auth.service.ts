import { SmsLogPurpose, UserRole } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { GetProfileResponse } from '@/auth/google/dto/responses/get-profile.response';
import { PasswordService } from '@/common/services/password/password.service';
import { RequestOtpDto, VerifyOtpDto } from '@/modules/auth/dto/auth.dto';
import { OtpService } from '@/common/services/otp/otp.service';
import { JwtAuthService } from '@/auth/jwt/jwt-auth.service';
import { SmsService } from '@/sms/sms.service';
import { AuthSettings } from '@/common/enums';
import {
  LoginMetaDto,
  LoginWithPasswordDto,
} from '@/modules/auth/dto/login-auth.dto';
import {
  AuthOtpRepository,
  SessionRepository,
  UserRepository,
} from '@/common/repositories';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly jwtService: JwtAuthService,
    private readonly userRepository: UserRepository,
    private readonly authOtpRepository: AuthOtpRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly otpService: OtpService,
    private readonly passwordService: PasswordService,
  ) {}

  async googleLogin(
    googleProfile: GetProfileResponse,
    fingerprint: string,
    ip: string,
    userAgent?: string,
  ) {
    const { id } = googleProfile;

    const user = await this.userRepository.findByGoogleId(id);

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
    const user = await this.userRepository.findByIdentifier(dto.login);

    if (!user || !user.password) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login },
      });
    }

    const isValid = await this.passwordService.verify(
      user.password,
      dto.password,
    );

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
    const user = await this.userRepository.findByPhoneRole(
      dto.phone,
      UserRole.USER,
    );

    const lastOtp = await this.authOtpRepository.findByPhone(dto.phone);

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();

      if (diff < AuthSettings.AUTH_OTP_RETRY_DIFFERENCE) {
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

    await this.authOtpRepository.deletePhones(dto.phone);

    const code = this.otpService.generateOtp();

    const hash = await this.otpService.hash(code);

    await this.authOtpRepository.create(
      dto.phone,
      hash,
      new Date(Date.now() + AuthSettings.AUTH_OTP_EXPIRES_AT),
    );

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
    const otp = await this.authOtpRepository.findByPhone(dto.phone);

    if (!otp) {
      throw new BadRequestException();
    }

    if (otp.expiresAt < new Date()) {
      await this.authOtpRepository.deletePhones(dto.phone);

      throw new BadRequestException({
        message: 'OTP expired',
        code: 'BAD_REQUEST',
        error: dto.phone,
      });
    }

    if (otp.attempts > AuthSettings.AUTH_OTP_ATTEMPTS) {
      await this.authOtpRepository.deletePhones(dto.phone);

      throw new HttpException(
        {
          message: 'Too many attempts. Please request new OTP',
          code: 'TOO_MANY_REQUESTS',
          error: dto.phone,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await this.otpService.verify(otp.code, dto.code);

    if (!isValid) {
      await this.authOtpRepository.increment(otp.id);

      throw new BadRequestException({
        message: 'Invalid OTP',
        code: 'BAD_REQUEST',
        error: dto.code,
      });
    }

    const user = await this.userRepository.upsert(
      dto.phone,
      UserRole.USER,
      'Гость',
    );

    await this.authOtpRepository.deletePhones(dto.phone);

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
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    await this.sessionRepository.inactivate(sessionId);

    return { success: true, message: 'Successfully logout' };
  }

  async upsertSession(userId: string, meta: LoginMetaDto) {
    const expiresAt = new Date(Date.now() + AuthSettings.SESSION_EXPIRES_AT);

    return await this.sessionRepository.upsert(
      {
        userId_fingerprint: {
          userId,
          fingerprint: meta.fingerprint,
        },
      },
      {
        fingerprint: meta.fingerprint,
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt,
        user: { connect: { id: userId } },
      },
      {
        userAgent: meta.userAgent,
        ip: meta.ip,
        lastActiveAt: new Date(),
        expiresAt,
        isActive: true,
      },
    );
  }
}
