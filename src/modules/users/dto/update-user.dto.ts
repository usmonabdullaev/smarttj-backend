import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'Fullname',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'example@example.com',
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
