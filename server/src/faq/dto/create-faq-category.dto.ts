import { IsBoolean, IsOptional } from 'class-validator';

export class CreateFaqCategoryDto {
  @IsOptional()
  @IsBoolean()
  visible: boolean;
}
