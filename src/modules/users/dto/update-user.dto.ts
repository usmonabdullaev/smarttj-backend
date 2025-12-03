import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'Fullname',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
  @IsString()
  regionId?: string;
}
