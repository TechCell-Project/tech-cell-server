import { RedisCacheModule } from '@app/common/RedisCache';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { AttributesModule } from '@app/resource/attributes';
import { Module } from '@nestjs/common';
import { CategoriesMntController } from './categories-mnt.controller';
import { CategoriesMntService } from './categories-mnt.service';
import { CategoriesModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, CategoriesModule, AttributesModule],
    controllers: [CategoriesMntController],
    providers: [CategoriesMntService, RabbitMQService],
})
export class CategoriesMntModule {}
