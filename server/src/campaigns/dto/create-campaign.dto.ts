import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Тема листа',
    example: 'Новинки місяця',
    maxLength: 200,
  })
  @IsString() @IsNotEmpty() @MaxLength(200)
  subject: string;

  @ApiProperty({
    description:
      'HTML-контент листа. Використовуйте плейсхолдер {{unsubscribeUrl}} — він буде замінений на посилання відписки для кожного отримувача.',
    example: '<p>Привіт!</p>',
  })
  @IsString() @IsNotEmpty()
  html: string;
}
