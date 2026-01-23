import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupportDto {
  @ApiProperty({
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
