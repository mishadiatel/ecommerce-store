import { IsOptional, IsMongoId } from 'class-validator';

export class CreateFaqDto {
  @IsOptional()
  @IsMongoId()
  faqCategoryId?: string;
}
