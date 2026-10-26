import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class RedisConfig {
  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsNumber()
  @Min(0)
  @Max(99999)
  REDIS_PORT!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD!: string;
}
