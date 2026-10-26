import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SysadminConfig {
  @IsEmail()
  SYSADMIN_EMAIL!: string;

  @IsString()
  @IsNotEmpty()
  SYSADMIN_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  SYSADMIN_PHONE!: string;

  @IsString()
  @IsNotEmpty()
  SYSADMIN_NAME!: string;
}
