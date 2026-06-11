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
} from '@nestjs/swagger';

import { LoginWithPasswordDto } from '@/modules/auth/dto/login-auth.dto';
import { GoogleOAuthService } from '@/auth/google/google-oauth.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import {
  LoginResponseDto,
  LogoutResponseDto,
} from '@/modules/auth/dto/auth-response.dto';

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

  @Post('request-otp')
  @ApiOperation({ summary: 'Request OTP' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return await this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.verifyOtp(dto, ip, userAgent);
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
