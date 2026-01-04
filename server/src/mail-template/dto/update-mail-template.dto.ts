import { PartialType } from '@nestjs/mapped-types';
import { CreateMailTemplateDto } from './create-mail-template.dto';

export class UpdateMailTemplateDto extends PartialType(CreateMailTemplateDto) {}
