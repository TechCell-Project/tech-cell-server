import { Discount } from '~libs/resource/discounts';
import { ApplyDiscountTo, DiscountType } from '~libs/resource/discounts/enums';
import { SelectProduct } from '~libs/resource/products/dtos/select-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { IsDateI18n, IsEnumI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class CreateDiscountRequestDTO
    implements Omit<Discount, '_id' | 'discountUsesCount' | 'discountUserUsed'>
{
    @ApiProperty({
        description: 'Discount name',
        example: 'Discount 1',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    discountName: string;

    @ApiProperty({
        description: 'Discount description',
        example: 'Discount 1',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    discountDescription: string;

    /**
     * @enum {DiscountType}
     */

    @ApiProperty({
        description: 'Discount type',
        example: 'PERCENT',
        enum: DiscountType,
    })
    @IsNotEmptyI18n()
    @IsEnumI18n(DiscountType)
    discountType: string;

    @ApiProperty({
        description: 'Discount value',
        example: '10',
        required: false,
    })
    @IsOptional()
    discountValue: string;

    discountCode: string;

    /**
     * @default new Date()
     */
    @IsDateI18n()
    discountStartDate: Date;

    /**
     * @default new Date()
     */
    @IsDateI18n()
    discountEndDate: Date;

    /**
     * @description Max num of use time
     * @default 0
     */
    @IsOptional()
    discountMaxUseTimes: number;

    /**
     * @description Max time of use per user
     * @default 0
     */
    @IsOptional()
    discountMaxUsesPerUser: number;

    /**
     * @description Min order value to use this discount
     * @default 0
     */
    @IsOptional()
    discountMinOrderValue: number;

    @IsOptional()
    discountIsActive: boolean;

    /**
     * @enum {ApplyDiscountTo}
     */
    @IsEnumI18n(ApplyDiscountTo)
    discountAppliesTo: string;

    @IsOptional()
    @ValidateNested({ each: true })
    discountProductApplies: Array<SelectProduct>;
}
