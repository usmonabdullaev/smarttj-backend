import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 9500 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsArray()
  images?: { url: string; urlId: string }[]; // URLs (cloudinary)
}

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung A56 8/256 GB' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'samsung-a56-8-256-gb-black-2025' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 12 })
  @IsOptional()
  @IsNumber()
  warranty?: number;

  @ApiProperty({ example: '019bdffb-8ca1-7065-9b3f-0fcdd97376bf' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: '019c02af-ac6a-7066-9a0e-5cd332e41a9f' })
  @IsUUID()
  brandId!: string;

  @ApiProperty({ example: '019c02af-ac6f-74ab-9108-7e4f5f473b58' })
  @IsUUID()
  modelId!: string;

  @ApiProperty({ example: '019c02d4-cfd3-76b2-8330-1574b0e4b0f2' })
  @IsUUID()
  regionId!: string;

  @ApiProperty({
    example:
      'Погрузитесь в мир безграничных возможностей со смартфоном Samsung Galaxy S25 FE, который воплощает в себе передовые технологии и утонченный стиль. Насладитесь кристально чистым изображением на Dynamic AMOLED 2X дисплее, который оживает яркими красками и невероятной детализацией. Частота обновления 120 Гц обеспечивает плавную прокрутку и мгновенный отклик, делая взаимодействие с контентом максимально комфортным. Защитите свои глаза от усталости благодаря технологии Eye Comfort Shield, снижающей вредное воздействие синего света.\nТройная камера с передовыми алгоритмами искусственного интеллекта позволит вам запечатлеть каждый момент вашей жизни в превосходном качестве. Делайте потрясающие снимки при любом освещении, снимайте захватывающие видео в формате 8K и раскройте свой творческий потенциал, экспериментируя с различными режимами и эффектами. Samsung Galaxy S25 FE оснащен мощным процессором, который обеспечивает молниеносную производительность в любых задачах. Играйте в любимые игры без тормозов, запускайте ресурсоемкие приложения и наслаждайтесь многозадачностью без каких-либо задержек.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ type: CreateProductVariantDto })
  @ValidateNested()
  @Type(() => CreateProductVariantDto)
  variant!: CreateProductVariantDto;
}
