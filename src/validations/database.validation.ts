import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  DATABASE_USER!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST!: string;

  @IsNumber()
  @Min(0)
  @Max(99999)
  DATABASE_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;
}
