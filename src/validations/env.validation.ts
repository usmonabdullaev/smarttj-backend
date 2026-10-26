import { ValidateNested, validateSync } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

import { AppConfig } from './app.validation';
import { DatabaseConfig } from './database.validation';
import { RedisConfig } from './redis.validation';
import { SysadminConfig } from './sysadmin.validation';
import { JwtConfig } from './jwt.validation';
import { GoogleConfig } from './google.validation';
import { FrontendConfig } from './frontend.validation';
import { ResendConfig } from './resend.validation';
import { SmsgateConfig } from './smsgate.validation';
import { TelegramConfig } from './telegram.validation';

export class RootConfig {
  @ValidateNested()
  @Type(() => AppConfig)
  app!: AppConfig;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  database!: DatabaseConfig;

  @ValidateNested()
  @Type(() => RedisConfig)
  redis!: RedisConfig;

  @ValidateNested()
  @Type(() => SysadminConfig)
  sysadmin!: SysadminConfig;

  @ValidateNested()
  @Type(() => JwtConfig)
  jwt!: JwtConfig;

  @ValidateNested()
  @Type(() => GoogleConfig)
  google!: GoogleConfig;

  @ValidateNested()
  @Type(() => FrontendConfig)
  frontend!: FrontendConfig;

  @ValidateNested()
  @Type(() => ResendConfig)
  resend!: ResendConfig;

  @ValidateNested()
  @Type(() => SmsgateConfig)
  smsgate!: SmsgateConfig;

  @ValidateNested()
  @Type(() => TelegramConfig)
  telegram!: TelegramConfig;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(RootConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
