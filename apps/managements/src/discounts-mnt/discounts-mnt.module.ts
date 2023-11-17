import { Module } from '@nestjs/common';
import { DiscountsMntController } from './discounts-mnt.controller';
import { DiscountsMntService } from './discounts-mnt.service';
import { DiscountsModule } from '@app/resource';
import { RabbitMQService } from '~libs/common/RabbitMQ';

@Module({
    imports: [DiscountsModule],
    controllers: [DiscountsMntController],
    providers: [DiscountsMntService, RabbitMQService],
    exports: [DiscountsMntService],
})
export class DiscountsMntModule {}
