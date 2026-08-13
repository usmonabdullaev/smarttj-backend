import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRequest {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  fullname!: string;

  @ApiProperty({
    example: 'Work address',
    description: 'Address name for user',
  })
  @IsString()
  label!: string;

  @ApiProperty({ example: 'Address', description: 'Address full string' })
  @IsString()
  address!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Set default for automatic save to orders',
  })
  @IsOptional()
  @IsBoolean()
  default?: boolean;

  @ApiPropertyOptional({
    example: '+992 999 999 999',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'ID',
    description: 'Region of address',
  })
  @IsOptional()
  @IsUUID(7)
  regionId?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Address longitude from map',
  })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Address latitude from map',
  })
  @IsOptional()
  @IsString()
  latitude?: string;
}
