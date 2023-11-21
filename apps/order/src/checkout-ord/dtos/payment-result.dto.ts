import { isTrueSet } from '~libs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { PaymentStatusEnum } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentResult {
    @ApiProperty({ type: Boolean, example: true })
    @IsBoolean()
    @Transform(({ value }) => isTrueSet(value))
    isSuccess: boolean;

    @ApiProperty({ type: String, example: PaymentStatusEnum.SUCCESS, enum: PaymentStatusEnum })
    @IsEnum(PaymentStatusEnum)
    paymentStatus: string;

    @ApiProperty({ type: String, example: 'Payment success' })
    @IsString()
    message: string;
}
