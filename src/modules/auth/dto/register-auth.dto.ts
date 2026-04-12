import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RequestRegisterOtpDto {
  @ApiProperty({
    example: '999999999',
  })
  @IsPhoneNumber('TJ')
  phone!: string;
}

export class ConfirmRegisterDto {
  @ApiProperty({
    example: 'John',
  })
  @IsString()
  @MinLength(2)
  name!: string;

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
