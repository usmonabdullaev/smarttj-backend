import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

@ApiSchema({ name: 'AdminUsersGetAllRequest' })
export class GetAllRequest {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000)
  limit?: number;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Search for phone, email and name',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  @IsOptional()
  @IsUUID(7)
  regionId?: string;
}
