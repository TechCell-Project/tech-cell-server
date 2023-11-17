import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule } from '~libs/resource';
import { Module } from '@nestjs/common';
import { AttributesMntController } from './attributes-mnt.controller';
import { AttributesMntService } from './attributes-mnt.service';

@Module({
    imports: [RedisCacheModule, AttributesModule],
    controllers: [AttributesMntController],
    providers: [RabbitMQService, AttributesMntService],
})
export class AttributesMntModule {}
