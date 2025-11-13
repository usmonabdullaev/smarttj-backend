import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id: string;

  @ApiProperty({ example: '900000000' })
  phone: string;

  @ApiProperty({ nullable: true, example: 'email@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  name: string;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({
    nullable: true,
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/avatar/mpmezwvtg0drxtllmm7a.png',
  })
  avatar: string;

  @ApiProperty({ nullable: true, example: 'avatar/mpmezwvtg0drxtllmm7a' })
  avatarId: string;

  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  regionId: string;

  @ApiProperty({ example: 100 })
  bonus: number;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt: string;
}
