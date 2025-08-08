import { IsMongoId, IsString } from 'class-validator';

export class CreateFaqCategoryTranslationDto {
  @IsMongoId()
  faqCategoryId: string;

  @IsString()
  lang: string;

  @IsString()
  name: string;
}
