import { ApiProperty } from '@nestjs/swagger';

export class TelegramLinkCodeResponseDto {
  @ApiProperty({ example: 'A8X2K9', description: 'Код привязки' })
  code!: string;

  @ApiProperty({
    example: 'https://t.me/smarttj_partner_bot?start=link_A8X2K9',
    description: 'Прямая ссылка для открытия бота и автоматической привязки',
  })
  linkUrl!: string;

  @ApiProperty({
    example: 'smarttj_partner_bot',
    nullable: true,
    description: 'Username Telegram-бота',
  })
  botUsername!: string | null;

  @ApiProperty({ example: 900, description: 'Срок действия кода в секундах' })
  expiresInSeconds!: number;
}

export class TelegramStatusResponseDto {
  @ApiProperty({ example: true, description: 'Привязан ли Telegram' })
  connected!: boolean;

  @ApiProperty({
    example: '123456789',
    nullable: true,
    description: 'Telegram ID пользователя',
  })
  telegramId!: string | null;

  @ApiProperty({
    example: 'smarttj_partner_bot',
    nullable: true,
    description: 'Username Telegram-бота',
  })
  botUsername!: string | null;
}
