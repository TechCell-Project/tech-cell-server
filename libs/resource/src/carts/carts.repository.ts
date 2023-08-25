import { AbstractRepository } from '@app/common/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Cart } from './schemas';

@Injectable()
export class CartsRepository extends AbstractRepository<Cart> {
    protected readonly logger = new Logger(CartsRepository.name);

    constructor(
        @InjectModel(Cart.name) cartModel: Model<Cart>,
        @InjectConnection() connection: Connection,
    ) {
        super(cartModel, connection);
    }
}
