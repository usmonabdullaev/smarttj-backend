import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Оценка товара от 1 до 5 звёзд',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Достоинства товара',
    example: 'Отличный экран и производительность',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  advantages?: string;

  @ApiPropertyOptional({
    description: 'Недостатки товара',
    example: 'Быстро пачкается задняя крышка',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  flaws?: string;

  @ApiPropertyOptional({
    description: 'Основной текст комментария',
    example: 'Обновил отзыв спустя месяц: батарея держит отлично.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  comment?: string;
}
