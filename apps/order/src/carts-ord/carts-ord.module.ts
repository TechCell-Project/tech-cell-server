import { Module } from '@nestjs/common';
import { CartsOrdController } from './carts-ord.controller';
import { CartsOrdService } from './carts-ord.service';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { CartsModule } from '@app/resource/carts';
import { ProductsModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, CartsModule, ProductsModule],
    controllers: [CartsOrdController],
    providers: [CartsOrdService, RabbitMQService],
})
export class CartsOrdModule {}
