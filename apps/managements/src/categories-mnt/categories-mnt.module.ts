import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';
import { AttributesModule } from '@app/resource/attributes';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoriesMntController } from './categories-mnt.controller';
import { CategoriesMntService } from './categories-mnt.service';
import { CategoriesModule } from '@app/resource';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        RedisCacheModule,
        CategoriesModule,
        AttributesModule,
    ],
    controllers: [CategoriesMntController],
    providers: [RabbitMQService, CategoriesMntService],
})
export class CategoriesMntModule {}
