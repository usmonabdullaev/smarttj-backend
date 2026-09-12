import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class AdminCreateAdminDto {
  @ApiProperty({ example: 'Али Самадов', description: 'Имя администратора' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: '+992900000005',
    description: 'Номер телефона администратора',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({
    example: 'admin@smarttj.com',
    description: 'Email администратора',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'AdminSecret123!',
    description: 'Пароль для входа (мин. 6 символов)',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    enum: [UserRole.ADMIN, UserRole.SYSADMIN, UserRole.MODERATOR],
    example: UserRole.ADMIN,
    description: 'Роль администратора (ADMIN, SYSADMIN или MODERATOR)',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
