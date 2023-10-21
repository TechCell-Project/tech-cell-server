import { GhnModule } from '@app/third-party';
import { Module } from '@nestjs/common';
import { AddressSearchController } from './address-search.controller';
import { AddressSearchService } from './address-search.service';
import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';

@Module({
    imports: [GhnModule, RedisCacheModule],
    controllers: [AddressSearchController],
    providers: [AddressSearchService, RabbitMQService],
})
export class AddressSearchModule {}
