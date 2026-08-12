import { IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqCategoryTranslationDto {
  @ApiProperty({
    description: 'Ідентифікатор категорії FAQ (MongoID)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  faqCategoryId: string;

  @ApiProperty({
    description: 'Код мови перекладу',
    example: 'uk',
  })
  @IsString()
  lang: string;

  @ApiProperty({
    description: 'Назва категорії FAQ',
    example: 'Оплата та доставка',
  })
  @IsString()
  name: string;
}
