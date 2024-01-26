import { isTrueSet } from '~libs/common';
import { Transform } from 'class-transformer';
import { PaymentStatusEnum } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanI18n, IsEnumI18n, IsStringI18n } from '~libs/common/i18n';

export class PaymentResult {
    @ApiProperty({ type: Boolean, example: true })
    @IsBooleanI18n()
    @Transform(({ value }) => isTrueSet(value))
    isSuccess: boolean;

    @ApiProperty({ type: String, example: PaymentStatusEnum.SUCCESS, enum: PaymentStatusEnum })
    @IsEnumI18n(PaymentStatusEnum)
    paymentStatus: string;

    @ApiProperty({ type: String, example: 'Payment success' })
    @IsStringI18n()
    message: string;
}
