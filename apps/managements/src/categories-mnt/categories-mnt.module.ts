import { RabbitMQService, RedisCacheModule } from '@app/common';
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
