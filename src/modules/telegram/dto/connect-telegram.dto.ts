import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectTelegramDto {
  @ApiProperty({
    example: 'A8X2K9',
    description: 'Одноразовый код связывания (полученный из веб-кабинета партнёра)',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    example: '123456789',
    description: 'Telegram ID пользователя (chat_id)',
  })
  @IsString()
  @IsNotEmpty()
  telegramId!: string;

  @ApiPropertyOptional({
    example: 'usmon_dev',
    description: 'Telegram username (без @)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'Usmon',
    description: 'Имя пользователя в Telegram',
  })
  @IsOptional()
  @IsString()
  firstName?: string;
}
