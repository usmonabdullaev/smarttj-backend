import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
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
  @IsString()
  @Matches(/^\d{9}$/, {
    message: 'Номер должен содержать ровно 9 цифр',
  })
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
