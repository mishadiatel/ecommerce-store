import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqCategoryTranslationDto } from './create-faq-category-translation.dto';

export class UpdateFaqCategoryTranslationDto extends PartialType(
  CreateFaqCategoryTranslationDto,
) {}
