import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class AdminUpdateAdminDto {
  @ApiPropertyOptional({
    example: 'Али Самадов',
    description: 'Имя администратора',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '+992900000005',
    description: 'Номер телефона',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'admin@smarttj.com',
    description: 'Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewAdminSecret123!',
    description: 'Новый пароль (оставьте пустым, если не нужно менять)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    enum: [UserRole.ADMIN, UserRole.SYSADMIN, UserRole.MODERATOR],
    example: UserRole.ADMIN,
    description: 'Роль администратора',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
