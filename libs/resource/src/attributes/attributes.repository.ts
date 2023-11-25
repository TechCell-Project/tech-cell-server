import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '~libs/resource/abstract';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Attribute } from './schemas';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class AttributesRepository extends AbstractRepository<Attribute> {
    protected readonly logger = new Logger(AttributesRepository.name);
    constructor(
        @InjectModel(Attribute.name) attributeModel: Model<Attribute>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(attributeModel, connection, i18n);
    }
}
