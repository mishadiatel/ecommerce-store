import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqCategoryDto } from './create-faq-category.dto';

export class UpdateFaqCategoryDto extends PartialType(CreateFaqCategoryDto) {}
