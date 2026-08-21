import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../utils/base-query.dto';
import { FeedbackType } from '../enum/feedback.enums';

export class FeedbackQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Фільтр за типом заявки.',
    enum: FeedbackType,
  })
  @IsOptional() @IsEnum(FeedbackType)
  type?: FeedbackType;

  @ApiPropertyOptional({
    description: '"true" — тільки непрочитані, "false" — тільки прочитані.',
    example: 'true',
  })
  @IsOptional() @IsString()
  isRead?: string;
}
