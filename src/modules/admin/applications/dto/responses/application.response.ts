import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationResponse {
  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'ID',
  })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of client' })
  name!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
    description: 'Created time',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
    description: 'Updated time',
  })
  updatedAt!: string;

  @ApiProperty({
    example: '+992123456789',
    description: 'Phone number of client',
  })
  phone!: string;

  @ApiProperty({
    example: 'Hello, I am interested in your services.',
    nullable: true,
    description: 'Message of client (optional)',
  })
  message!: string | null;

  @ApiProperty({
    example: 'NEW',
    enum: ApplicationStatus,
    description: 'Status',
  })
  status!: ApplicationStatus;

  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
    description: 'Client profile ID (if registered)',
  })
  userId!: string | null;
}
