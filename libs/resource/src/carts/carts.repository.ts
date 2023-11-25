import { AbstractRepository } from '~libs/resource/abstract';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Cart } from './schemas';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class CartsRepository extends AbstractRepository<Cart> {
    protected readonly logger = new Logger(CartsRepository.name);

    constructor(
        @InjectModel(Cart.name) cartModel: Model<Cart>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(cartModel, connection, i18n);
    }
}
