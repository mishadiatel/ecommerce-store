import { IsOptional, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiPropertyOptional({
    description: 'Ідентифікатор категорії FAQ (MongoID)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  faqCategoryId?: string;
}
