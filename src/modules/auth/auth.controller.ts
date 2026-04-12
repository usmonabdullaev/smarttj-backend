import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { LoginResponseDto, LogoutResponseDto } from './dto/auth-response.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ApiErrorDto } from '../../common/dto/api-error.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  ConfirmRegisterDto,
  RequestRegisterOtpDto,
} from './dto/register-auth.dto';
import {
  ConfirmLoginOtpDto,
  LoginWithPasswordDto,
  RequestLoginOtpDto,
} from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
