import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramConfig {
  @IsString()
  @IsNotEmpty()
  TELEGRAM_BOT_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_BOT_SECRET!: string;
}
