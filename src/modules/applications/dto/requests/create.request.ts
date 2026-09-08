import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

@ApiSchema({ name: 'ApplicationCreateRequest' })
export class CreateRequest {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone!: string;

  @ApiPropertyOptional({ example: 'Hello, I am interested in your services.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID(7)
  userId?: string;
}
