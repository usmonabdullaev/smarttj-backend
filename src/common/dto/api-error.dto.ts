import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ example: null, nullable: true })
  error?: any;
}
