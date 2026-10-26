import { IsNotEmpty, IsString } from 'class-validator';

export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;
}
