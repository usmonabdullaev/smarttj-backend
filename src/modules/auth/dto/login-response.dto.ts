import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...8VRx4vI4E',
  })
  token: string;

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
