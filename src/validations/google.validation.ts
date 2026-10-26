/**
 * GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=GOOGLE_CALLBACK_URL
 */

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GoogleConfig {
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl()
  GOOGLE_CALLBACK_URL!: string;
}
