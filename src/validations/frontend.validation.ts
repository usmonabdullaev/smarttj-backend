import { IsUrl } from 'class-validator';

export class FrontendConfig {
  @IsUrl()
  FRONTEND_URL!: string;
}
