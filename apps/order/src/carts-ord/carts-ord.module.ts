import { Module } from '@nestjs/common';
import { CartsOrdController } from './carts-ord.controller';
import { CartsOrdService } from './carts-ord.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { CartsModule } from '@app/resource/carts';
import { ProductsModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, CartsModule, ProductsModule],
    controllers: [CartsOrdController],
    providers: [CartsOrdService, RabbitMQService],
})
export class CartsOrdModule {}