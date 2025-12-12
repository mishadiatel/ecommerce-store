import { PartialType } from '@nestjs/swagger';
import { CreateSettingsTranslationDto } from './create-settings-translation.dto';

export class UpdateSettingsTranslationDto extends PartialType(
  CreateSettingsTranslationDto,
) {}
