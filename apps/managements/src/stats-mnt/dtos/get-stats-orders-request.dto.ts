import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum, PaymentStatusEnum } from '~libs/resource';
import { StatsGetBy } from '../enums';
import { IsOptional } from 'class-validator';
import { IsEnumI18n } from '~libs/common/i18n';

export class GetStatsOrdersRequestDTO {
    @ApiProperty({
        required: false,
        description: 'Status of type to get stats',
        enum: OrderStatusEnum,
        example: OrderStatusEnum.COMPLETED,
    })
    @IsOptional()
    @IsEnumI18n(OrderStatusEnum)
    orderStatus: OrderStatusEnum;

    @ApiProperty({
        required: false,
        description: 'Status of payment to get stats',
        enum: PaymentStatusEnum,
        example: PaymentStatusEnum.COMPLETED,
    })
    @IsOptional()
    @IsEnumI18n(PaymentStatusEnum)
    paymentStatus: PaymentStatusEnum;

    @ApiProperty({
        required: false,
        description: 'Get stats by field, default is createdAt',
        enum: StatsGetBy,
        example: StatsGetBy.createdAt,
        default: StatsGetBy.createdAt,
    })
    @IsOptional()
    @IsEnumI18n(StatsGetBy)
    getBy?: StatsGetBy;
}
