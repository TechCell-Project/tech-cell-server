import { OrderStatusEnum } from '~libs/resource/orders/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnumI18n, IsNotEmptyI18n } from '~libs/common/i18n';

export class UpdateOrderStatusDTO {
    @ApiProperty({
        description: 'Order status to update',
        enum: OrderStatusEnum,
        example: OrderStatusEnum.CANCELLED,
    })
    @IsNotEmptyI18n()
    @IsEnumI18n(OrderStatusEnum)
    orderStatus: string;
}
