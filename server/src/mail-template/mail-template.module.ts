import { Module } from '@nestjs/common';
import { MailTemplateService } from './mail-template.service';
import { MailTemplateController } from './mail-template.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MailTemplate,
  MailTemplateSchema,
} from './schemas/mail-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailTemplate.name, schema: MailTemplateSchema },
    ]),
  ],
  controllers: [MailTemplateController],
  providers: [MailTemplateService],
  exports: [MailTemplateService],
})
export class MailTemplateModule {}
