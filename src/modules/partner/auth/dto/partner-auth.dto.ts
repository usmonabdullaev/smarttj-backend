import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PartnerRegisterRequestDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone!: string;
}

export class PartnerRegisterVerifyDto {
  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @MinLength(4)
  code!: string;

  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
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
  @IsPhoneNumber('TJ')
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
  @IsPhoneNumber('TJ')
  phone!: string;
}

export class PartnerLoginVerifyDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone!: string;

  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @MinLength(4)
  code!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint!: string;
}
