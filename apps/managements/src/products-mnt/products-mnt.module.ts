import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '@app/resource/products';
import { ProductsMntController } from './products-mnt.controller';
import { ProductsMntService } from './products-mnt.service';
import { RabbitMQModule, RabbitMQService, RedisCacheModule } from '@app/common';

@Module({
    imports: [
        RabbitMQModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './.env',
        }),
        ProductsModule,
        RedisCacheModule,
    ],
    controllers: [ProductsMntController],
    providers: [RabbitMQService, ProductsMntService],
})
export class ProductsMntModule {}
