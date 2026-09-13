import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID товара (UUID)',
    example: '0192e21b-68d1-7000-8000-000000000001',
  })
  @IsNotEmpty()
  @IsUUID('7')
  productId!: string;

  @ApiPropertyOptional({
    description: 'ID конкретного купленного варианта товара (UUID)',
    example: '0192e21b-68d1-7000-8000-000000000002',
  })
  @IsOptional()
  @IsUUID('7')
  productVariantId?: string;

  @ApiPropertyOptional({
    description: 'ID заказа покупателя (для подтверждения покупки)',
    example: '0192e21b-68d1-7000-8000-000000000003',
  })
  @IsOptional()
  @IsUUID('7')
  orderId?: string;

  @ApiProperty({
    description: 'Оценка товара от 1 до 5 звёзд',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Достоинства товара',
    example: 'Быстрая доставка, отличный экран, высокое качество сборки',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  advantages?: string;

  @ApiPropertyOptional({
    description: 'Недостатки товара',
    example: 'В комплекте нет блока питания',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  flaws?: string;

  @ApiPropertyOptional({
    description: 'Основной текст комментария',
    example:
      'Пользуюсь уже неделю, всё работает отлично. Рекомендую к покупке!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'Массив ссылок на фотографии товара (Cloudinary)',
    example: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  images?: string[];
}
