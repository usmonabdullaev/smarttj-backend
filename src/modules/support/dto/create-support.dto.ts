import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupportDto {
  @ApiProperty({
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'ID' })
  @IsUUID(7)
  chatId!: string;

  @ApiProperty({
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
