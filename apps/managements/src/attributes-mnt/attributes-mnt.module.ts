import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule } from '~libs/resource';
import { Module } from '@nestjs/common';
import { AttributesMntController } from './attributes-mnt.controller';
import { AttributesMntService } from './attributes-mnt.service';
import { RedisModule } from '~libs/common/Redis';

@Module({
    imports: [AttributesModule, RedisModule],
    controllers: [AttributesMntController],
    providers: [RabbitMQService, AttributesMntService],
})
export class AttributesMntModule {}
