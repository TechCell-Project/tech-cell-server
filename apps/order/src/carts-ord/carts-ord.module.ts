import { Module } from '@nestjs/common';
import { CartsOrdController } from './carts-ord.controller';
import { CartsOrdService } from './carts-ord.service';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { CartsModule } from '~libs/resource/carts';
import { ProductsModule } from '~libs/resource';

@Module({
    imports: [RedisModule, CartsModule, ProductsModule],
    controllers: [CartsOrdController],
    providers: [CartsOrdService, RabbitMQService],
})
export class CartsOrdModule {}
