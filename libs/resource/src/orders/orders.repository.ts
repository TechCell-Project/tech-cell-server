import { AbstractRepository } from '~libs/resource/abstract';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { I18n, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class OrderRepository extends AbstractRepository<Order> {
    protected readonly logger = new Logger(OrderRepository.name);

    constructor(
        @InjectModel(Order.name) orderModel: Model<Order>,
        @InjectConnection() connection: Connection,
        @I18n() i18n: I18nService<I18nTranslations>,
    ) {
        super(orderModel, connection, i18n);
    }
}
