import { Discount } from '@app/resource/discounts';
import { ApplyDiscountTo, DiscountType } from '@app/resource/discounts/enums';
import { SelectProduct } from '@app/resource/products/dtos/select-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateDiscountRequestDTO
    implements Omit<Discount, '_id' | 'discountUsesCount' | 'discountUserUsed'>
{
    @ApiProperty({
        description: 'Discount name',
        example: 'Discount 1',
    })
    @IsNotEmpty()
    @IsString()
    discountName: string;

    @ApiProperty({
        description: 'Discount description',
        example: 'Discount 1',
    })
    @IsNotEmpty()
    @IsString()
    discountDescription: string;

    /**
     * @enum {DiscountType}
     */

    @ApiProperty({
        description: 'Discount type',
        example: 'PERCENT',
        enum: DiscountType,
    })
    @IsNotEmpty()
    @IsEnum(DiscountType)
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
    @IsDate()
    discountStartDate: Date;

    /**
     * @default new Date()
     */
    @IsDate()
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
    @IsEnum(ApplyDiscountTo)
    discountAppliesTo: string;

    @IsOptional()
    @ValidateNested({ each: true })
    discountProductApplies: Array<SelectProduct>;
}
