import { IsNotEmpty, IsString } from 'class-validator';

export class ResendConfig {
  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY!: string;
}
