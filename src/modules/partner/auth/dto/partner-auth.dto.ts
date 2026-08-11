import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PartnerRegisterRequestDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер должен содержать ровно 9 цифр',
  })
  phone!: string;
}

export class PartnerRegisterVerifyDto {
  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @Length(4, 8)
  code!: string;

  @ApiProperty({
    example: '999999999',
  })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер пользователь должен содержать ровно 9 цифр',
  })
  user_phone!: string;

  @ApiProperty({
    example: 'John',
  })
  @IsString()
  @MinLength(3)
  user_name!: string;

  @ApiProperty({
    example: 'Company Name',
  })
  @IsString()
  @MinLength(4)
  title!: string;

  @ApiProperty({
    example: '999999999',
  })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер компании должен содержать ровно 9 цифр',
  })
  phone1!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint!: string;
}

export class PartnerLoginRequestDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер должен содержать ровно 9 цифр',
  })
  phone!: string;
}

export class PartnerLoginVerifyDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер должен содержать ровно 9 цифр',
  })
  phone!: string;

  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @Length(4, 8)
  code!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint!: string;
}
