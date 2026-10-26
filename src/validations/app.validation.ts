import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

export class AppConfig {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999)
  PORT?: number;
}
