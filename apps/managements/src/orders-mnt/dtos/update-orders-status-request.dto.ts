import { OrderStatusEnum } from '@app/resource/orders/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDTO {
    @ApiProperty({
        description: 'Order status to update',
        enum: OrderStatusEnum,
        example: OrderStatusEnum.CANCELLED,
    })
    @IsNotEmpty()
    @IsEnum(OrderStatusEnum)
    orderStatus: string;
}
