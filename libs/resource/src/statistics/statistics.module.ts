import { Module } from '@nestjs/common';
import { RedisModule } from '~libs/common/Redis';
import { StatisticsService } from './services';
import { OrdersModule } from '~libs/resource/orders';
import { ProductsModule } from '~libs/resource/products';

@Module({
    imports: [RedisModule, OrdersModule, ProductsModule],
    providers: [StatisticsService],
    exports: [StatisticsService],
})
export class StatisticsModule {}
