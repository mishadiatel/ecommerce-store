import { IsMongoId, IsString } from 'class-validator';

export class CreateFaqTranslationDto {
  @IsMongoId()
  faqId: string;

  @IsString()
  lang: string;

  @IsString()
  question: string;

  @IsString()
  answer: string;
}
