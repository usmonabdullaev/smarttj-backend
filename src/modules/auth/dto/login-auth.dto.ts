import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithPasswordDto {
  @ApiProperty({
    example: 'abdullaevusmon2006@gmail.com',
    description: 'Email или номер телефона',
  })
  @IsString()
  @IsNotEmpty()
  login: string; // email или phone

  @ApiProperty({
    example: 'admin123',
    description: 'Пароль',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
    description: 'Уникальный fingerprint устройства',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}

export class RequestLoginOtpDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone: string;
}

export class ConfirmLoginOtpDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  code: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}

export class LoginMetaDto {
  fingerprint: string;
  userAgent?: string;
  ip?: string;
}
