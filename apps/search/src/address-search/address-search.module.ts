import { GhnModule } from '~libs/third-party';
import { Module } from '@nestjs/common';
import { AddressSearchController } from './address-search.controller';
import { AddressSearchService } from './address-search.service';
import { RedisModule } from '~libs/common/Redis';
import { RabbitMQService } from '~libs/common/RabbitMQ';

@Module({
    imports: [
        GhnModule.forRoot({
            host: process.env.GHN_URL,
            token: process.env.GHN_API_TOKEN,
            shopId: +process.env.GHN_SHOP_ID,
            testMode: true,
        }),
        RedisModule,
    ],
    controllers: [AddressSearchController],
    providers: [AddressSearchService, RabbitMQService],
})
export class AddressSearchModule {}
