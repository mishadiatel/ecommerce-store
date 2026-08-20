import { PartialType } from '@nestjs/mapped-types';
import { CreatePopularQueryDto } from './create-popular-query.dto';

export class UpdatePopularQueryDto extends PartialType(CreatePopularQueryDto) {}
