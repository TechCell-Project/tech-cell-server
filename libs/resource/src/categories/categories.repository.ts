import { AbstractRepository } from '~libs/resource/abstract';
import { Category } from './schemas';
import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

export class CategoriesRepository extends AbstractRepository<Category> {
    protected readonly logger = new Logger(CategoriesRepository.name);

    constructor(
        @InjectModel(Category.name) productModel: Model<Category>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(productModel, connection, i18n);
    }
}
