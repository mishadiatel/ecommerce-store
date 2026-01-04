import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { GeneralModule } from '../general/general.module';
import { MailTemplateModule } from '../mail-template/mail-template.module';

@Module({
  imports: [ConfigModule, GeneralModule, MailTemplateModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
