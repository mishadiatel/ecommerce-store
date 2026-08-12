import { IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqTranslationDto {
  @ApiProperty({
    description: 'Ідентифікатор FAQ (MongoID)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  faqId: string;

  @ApiProperty({
    description: 'Код мови перекладу',
    example: 'uk',
  })
  @IsString()
  lang: string;

  @ApiProperty({
    description: 'Запитання FAQ',
    example: 'Як оформити замовлення?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Відповідь на запитання FAQ',
    example: 'Оберіть товар і натисніть кнопку "Купити".',
  })
  @IsString()
  answer: string;
}
