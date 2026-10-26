import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SmsgateConfig {
  @IsString()
  @IsNotEmpty()
  SMSGATE_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  SMSGATE_SENDER_ADDRESS!: string;

  @IsUrl()
  SMSGATE_API_URL!: string;
}
