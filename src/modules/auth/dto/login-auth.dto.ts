import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'admin@smart.tj',
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
