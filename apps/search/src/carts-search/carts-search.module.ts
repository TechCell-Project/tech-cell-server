import { RedisCacheModule } from '@app/common/RedisCache';
import { CartsModule } from '@app/resource/carts';
import { Logger, Module } from '@nestjs/common';
import { CartsSearchController } from './carts-search.controller';
import { RabbitMQService } from '@app/common';
import { CartsSearchService } from './carts-search.service';

@Module({
    imports: [RedisCacheModule, CartsModule],
    controllers: [CartsSearchController],
    providers: [RabbitMQService, CartsSearchService, Logger],
})
export class CartsSearchModule {}
