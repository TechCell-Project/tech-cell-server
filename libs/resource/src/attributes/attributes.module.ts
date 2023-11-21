import { Module } from '@nestjs/common';
import { MongodbModule } from '~libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from './schemas';
import { AttributesService } from './attributes.service';
import { AttributesRepository } from './attributes.repository';

@Module({
    imports: [
        MongodbModule,
        MongooseModule.forFeature([{ name: Attribute.name, schema: AttributeSchema }]),
    ],
    controllers: [],
    providers: [AttributesService, AttributesRepository],
    exports: [AttributesService],
})
export class AttributesModule {}
