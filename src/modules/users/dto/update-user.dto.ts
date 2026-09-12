import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'Fullname',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'example@example.com',
    description: 'Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'User avatar (file)',
  })
  @IsOptional()
  avatar?: string; // тип `any`, чтобы Swagger правильно отобразил input type="file"

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'Region ID',
  })
  @IsOptional()
  @IsUUID(7)
  regionId?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Telegram user ID',
  })
  @IsOptional()
  @IsString()
  telegramId?: string;
}

export class SetPasswordDto {
  @ApiPropertyOptional({
    example: 'OldPass123!',
    description: 'Текущий пароль (обязателен, если пароль уже был установлен)',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    example: '',
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'If its true terminate other sessions',
  })
  @IsOptional()
  @IsBoolean()
  terminateOtherSessions?: boolean;
}
