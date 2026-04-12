import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...8VRx4vI4E',
  })
  token!: string;

  @ApiProperty({
    example: {
      id: '019a6263-6f97-7230-8449-e979b855ada1',
      phone: '900000000',
      email: 'example@mail.com',
      name: 'John',
      role: 'USER',
      avatar:
        'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/avatar/mpmezwvtg0drxtllmm7a.png',
      avatarId: 'avatar/mpmezwvtg0drxtllmm7a',
      regionId: '019a6263-6f97-7230-8449-e979b855ada1',
      bonus: 100,
      createdAt: '2025-11-08T07:34:35.160Z',
      updatedAt: '2025-11-08T07:34:35.160Z',
    },
  })
  user: any;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  id!: string;

  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  userId!: string;

  @ApiProperty({
    example: 'fp_293hf293f23f23',
  })
  fingerprint!: string;

  @ApiProperty({
    example: 'Chrome',
  })
  userAgent!: string | null;

  @ApiProperty({
    example: '142.54.46.279:3000',
  })
  ip!: string | null;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  expiresAt!: string;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...8VRx4vI4E',
  })
  pushToken!: string | null;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  lastActiveAt!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  updatedAt!: string;
}
