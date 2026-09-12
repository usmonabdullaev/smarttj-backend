import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttributeValueDto {
  @ApiPropertyOptional({ example: 'Черный', description: 'Строковое значение' })
  @IsOptional()
  @IsString()
  valueString?: string;

  @ApiPropertyOptional({ example: 256, description: 'Числовое значение' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional({ example: true, description: 'Логическое значение' })
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional({
    example: '256 ГБ',
    description: 'Отображаемая подпись / метка',
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateAttributeValueDto {
  @ApiPropertyOptional({ example: 'Черный' })
  @IsOptional()
  @IsString()
  valueString?: string;

  @ApiPropertyOptional({ example: 256 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional({ example: '256 ГБ' })
  @IsOptional()
  @IsString()
  label?: string;
}
