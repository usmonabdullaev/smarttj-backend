import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReplyReviewDto {
  @ApiProperty({
    example:
      'Спасибо за ваш отзыв! Мы рады, что товар вам понравился. Приятного использования!',
    description: 'Текст официального ответа продавца на отзыв покупателя',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  replyComment!: string;
}
