import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { Contacts, ContactsSchema } from './schemas/contacts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contacts.name, schema: ContactsSchema },
    ]),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
