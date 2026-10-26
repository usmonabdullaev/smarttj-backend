import { IsNotEmpty, IsString } from 'class-validator';

export class CloudinaryConfig {
  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME!: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_URL!: string;
}
