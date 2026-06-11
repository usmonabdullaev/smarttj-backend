import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone!: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  code!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  @IsString()
  @IsNotEmpty()
  fingerprint!: string;
}
