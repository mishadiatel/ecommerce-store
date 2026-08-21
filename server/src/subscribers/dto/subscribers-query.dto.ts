import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../utils/base-query.dto';

export class SubscribersQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: '"true" — активні, "false" — відписані.',
    example: 'true',
  })
  @IsOptional() @IsString()
  isActive?: string;
}
