import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';
import { AttributesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttributesSearchController } from './attributes-search.controller';
import { AttributesSearchService } from './attributes-search.service';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        AttributesModule,
        RedisCacheModule,
    ],
    controllers: [AttributesSearchController],
    providers: [RabbitMQService, AttributesSearchService],
})
export class AttributesSearchModule {}
