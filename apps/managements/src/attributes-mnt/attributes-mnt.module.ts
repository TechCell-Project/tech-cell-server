import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { AttributesModule } from '@app/resource';
import { Module } from '@nestjs/common';
import { AttributesMntController } from './attributes-mnt.controller';
import { AttributesMntService } from './attributes-mnt.service';

@Module({
    imports: [RedisCacheModule, AttributesModule],
    controllers: [AttributesMntController],
    providers: [RabbitMQService, AttributesMntService],
})
export class AttributesMntModule {}
