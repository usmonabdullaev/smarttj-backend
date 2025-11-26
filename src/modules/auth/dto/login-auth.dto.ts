import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email или номер телефона',
  })
  @IsString()
  @IsNotEmpty()
  login: string; // email или phone

  @ApiProperty({
    example: 'admin',
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
