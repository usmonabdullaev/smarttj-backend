import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithPasswordDto {
  @ApiProperty({
    example: 'abdullaevusmon2006@gmail.com',
    description: 'Email или номер телефона',
  })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Пароль',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
    description: 'Уникальный fingerprint устройства',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint!: string;
}

export class LoginMetaDto {
  fingerprint!: string;
  userAgent?: string;
  ip?: string;
}
