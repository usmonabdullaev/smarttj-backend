import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

export class AdminGetAdminsDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Количество записей на страницу',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'Али',
    description: 'Поисковый запрос (по имени, телефону или email)',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: [UserRole.ADMIN, UserRole.SYSADMIN, UserRole.MODERATOR],
    example: UserRole.ADMIN,
    description: 'Фильтр по роли администратора',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
