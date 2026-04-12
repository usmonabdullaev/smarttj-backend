import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupportDto {
  @ApiProperty({
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
