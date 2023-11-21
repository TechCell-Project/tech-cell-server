import { RedisCacheModule } from '~libs/common/RedisCache';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesModule } from '~libs/resource/attributes';
import { Module } from '@nestjs/common';
import { CategoriesMntController } from './categories-mnt.controller';
import { CategoriesMntService } from './categories-mnt.service';
import { CategoriesModule } from '~libs/resource';

@Module({
    imports: [RedisCacheModule, CategoriesModule, AttributesModule],
    controllers: [CategoriesMntController],
    providers: [CategoriesMntService, RabbitMQService],
})
export class CategoriesMntModule {}
