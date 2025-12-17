import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqTranslationDto } from './create-faq-translation.dto';

export class UpdateFaqTranslationDto extends PartialType(
  CreateFaqTranslationDto,
) {}
