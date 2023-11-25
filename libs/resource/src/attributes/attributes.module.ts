import { Module } from '@nestjs/common';
import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from './schemas';
import { AttributesService } from './attributes.service';
import { AttributesRepository } from './attributes.repository';
import { I18nModule } from '~libs/common/i18n';

@Module({
    imports: [
        I18nModule,
        MongodbModule,
        MongooseModule.forFeature([{ name: Attribute.name, schema: AttributeSchema }]),
    ],
    providers: [AttributesService, AttributesRepository],
    exports: [AttributesService],
})
export class AttributesModule {}
