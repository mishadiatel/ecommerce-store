import { Module } from '@nestjs/common';
import { GeneralService } from './general.service';
import { GeneralController } from './general.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GeneralSettings,
  GeneralSettingsSchema,
} from './schemas/general.schema';
import {
  GeneralSettingsTranslation,
  GeneralSettingsTranslationSchema,
} from './schemas/generalTranslation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneralSettings.name, schema: GeneralSettingsSchema },
      {
        name: GeneralSettingsTranslation.name,
        schema: GeneralSettingsTranslationSchema,
      },
    ]),
  ],
  controllers: [GeneralController],
  providers: [GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {}
