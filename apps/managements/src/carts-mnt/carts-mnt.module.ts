import { Module } from '@nestjs/common';
import { CartsMntController } from './carts-mnt.controller';
import { CartsMntService } from './carts-mnt.service';
import { RabbitMQService, RedisCacheModule } from '@app/common';
import { CartsModule } from '@app/resource/carts';
import { ProductsModule } from '@app/resource';

@Module({
    imports: [RedisCacheModule, CartsModule, ProductsModule],
    controllers: [CartsMntController],
    providers: [CartsMntService, RabbitMQService],
})
export class CartsMntModule {}
