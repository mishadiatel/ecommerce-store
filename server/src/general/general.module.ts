import { Module } from '@nestjs/common';
import { GeneralService } from './general.service';
import { GeneralController } from './general.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GeneralSettings,
  GeneralSettingsSchema,
} from './schemas/general.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneralSettings.name, schema: GeneralSettingsSchema },
    ]),
  ],
  controllers: [GeneralController],
  providers: [GeneralService],
})
export class GeneralModule {}
