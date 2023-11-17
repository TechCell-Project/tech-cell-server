import { AllEnum } from '~libs/common/base/enums';
import { PaginationQuery } from '~libs/common/dtos';
import { OrderStatusEnum, PaymentMethodEnum, PaymentStatusEnum } from '@app/resource/orders/enums';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class GetOrdersRequestDTO extends IntersectionType(PaginationQuery) {
    @ApiProperty({
        required: false,
        description: 'Order ID to filter orders by order',
        type: String,
        format: 'ObjectId',
        example: '64de47577d02235471fcedb2',
    })
    @IsOptional()
    @IsMongoId()
    @Type(() => Types.ObjectId)
    orderId: Types.ObjectId;

    @ApiProperty({
        required: false,
        description: 'User ID to filter orders by user',
        type: String,
        format: 'ObjectId',
        example: '64de47577d02235471fcedb2',
    })
    @IsOptional()
    @IsMongoId()
    @Type(() => Types.ObjectId)
    userId?: Types.ObjectId;

    @ApiProperty({
        required: false,
        description: 'Product ID to filter orders by product',
        type: String,
        format: 'ObjectId',
        example: '650a8f68e3729aa77877d4f0',
    })
    @IsOptional()
    @IsMongoId()
    @Type(() => Types.ObjectId)
    productId?: Types.ObjectId;

    @ApiProperty({
        required: false,
        description: 'Tracking code to filter orders by tracking code',
        example: '1490-1A0807-1698506531006',
    })
    @IsOptional()
    @IsString()
    trackingCode?: string;

    @ApiProperty({
        description: 'Payment method to filter orders by payment method',
        enum: { ...AllEnum, ...PaymentMethodEnum },
        required: false,
        default: AllEnum.all,
    })
    @IsOptional()
    @IsEnum({ ...AllEnum, ...PaymentMethodEnum })
    paymentMethod?: string;

    @ApiProperty({
        description: 'Payment status to filter orders by payment status',
        enum: { ...AllEnum, ...PaymentStatusEnum },
        required: false,
        default: AllEnum.all,
    })
    @IsOptional()
    @IsEnum({ ...AllEnum, ...PaymentStatusEnum })
    paymentStatus?: string;

    @ApiProperty({
        required: false,
        description: 'Order status to filter orders by order status',
        enum: { ...AllEnum, ...OrderStatusEnum },
        default: AllEnum.all,
    })
    @IsOptional()
    @IsEnum({ ...AllEnum, ...OrderStatusEnum })
    orderStatus?: string;
}
