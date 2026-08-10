import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({
    example: 'SERVER_ERROR',
    description: 'Error code',
  })
  code!: string;

  @ApiProperty({
    example: 'Server Error',
    description: 'Error message',
  })
  message!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Error details',
  })
  error?: any;
}
