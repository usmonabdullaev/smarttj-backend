import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId: string;

  @ApiProperty({ example: 'fp_293hf293f23f23' })
  fingerprint: string;

  @ApiProperty({
    example: 'Google Chrome',
    nullable: true,
  })
  userAgent: string;

  @ApiProperty({
    nullable: true,
    example: '157.230.69.73:443',
  })
  ip: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  expiresAt: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ nullable: true, example: 'a2Jqsd0kanz...' })
  pushToken: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  lastActiveAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt: string;
}

export class SessionsResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId: string;

  @ApiProperty({ example: 'fp_293hf293f23f23' })
  fingerprint: string;

  @ApiProperty({
    example: 'Google Chrome',
    nullable: true,
  })
  userAgent: string;

  @ApiProperty({
    nullable: true,
    example: '157.230.69.73:443',
  })
  ip: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  expiresAt: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ nullable: true, example: 'a2Jqsd0kanz...' })
  pushToken: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  lastActiveAt: string;

  @ApiProperty({ example: true })
  current: boolean;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt: string;
}
