import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '~libs/resource/abstract';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Product } from './schemas';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class ProductsRepository extends AbstractRepository<Product> {
    protected readonly logger = new Logger(ProductsRepository.name);
    constructor(
        @InjectModel(Product.name) productModel: Model<Product>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(productModel, connection, i18n);
    }
}
