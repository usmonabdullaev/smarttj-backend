import { Response } from 'express';
import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  Delete,
  UseGuards,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { GoogleOAuthService } from '@/auth/google/google-oauth.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import {
  LoginResponseDto,
  LogoutResponseDto,
} from '@/modules/auth/dto/auth-response.dto';
import {
  ConfirmRegisterDto,
  RequestRegisterOtpDto,
} from '@/modules/auth/dto/register-auth.dto';
import {
  ConfirmLoginOtpDto,
  LoginWithPasswordDto,
  RequestLoginOtpDto,
} from '@/modules/auth/dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  @Get('google')
  googleAuth(@Query('fingerprint') fingerprint: string, @Res() res: Response) {
    const url = this.googleOAuthService.getAuthUrl(fingerprint);

    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') fingerprint: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const tokens = await this.googleOAuthService.getTokens(code);

    const profile = await this.googleOAuthService.getProfile(
      tokens.access_token,
    );

    const user = await this.authService.googleLogin(
      profile,
      fingerprint,
      ip,
      userAgent,
    );

    return res.json(user);
  }

  @Post('register/request-otp')
  @ApiOperation({ summary: 'Request to register' })
  async requestRegisterOtp(@Body() dto: RequestRegisterOtpDto) {
    return await this.authService.requestRegisterOtp(dto);
  }

  @Post('register/confirm-otp')
  @ApiOperation({ summary: 'Confirm register' })
  @ApiOkResponse({ type: LoginResponseDto })
  async confirmRegisterOtp(
    @Body() dto: ConfirmRegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.confirmRegisterOtp(dto, ip, userAgent);
  }

  @Post('login/password')
  @ApiOperation({ summary: 'Login with password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async loginWithPassword(
    @Body() dto: LoginWithPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.loginWithPassword(dto, ip, userAgent);
  }

  @Post('login/request-otp')
  @ApiOperation({ summary: 'Request login OTP' })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async requestLoginOtp(@Body() dto: RequestLoginOtpDto) {
    return await this.authService.requestLoginOtp(dto);
  }

  @Post('login/confirm-otp')
  @ApiOperation({ summary: 'Confirm login OTP' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  async confirmLoginOtp(
    @Body() dto: ConfirmLoginOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.confirmLoginOtp(dto, ip, userAgent);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async logout(@GetUser('sessionId') sessionId: string) {
    return await this.authService.logout(sessionId);
  }
}
