import { PartialType } from '@nestjs/mapped-types';
import {
  CreateCategoryDto,
  CreateCategoryTranslationDto,
} from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class UpdateCategoryTranslationDto extends PartialType(
  CreateCategoryTranslationDto,
) {}
