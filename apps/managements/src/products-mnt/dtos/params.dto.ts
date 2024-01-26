import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsMongoIdI18n, IsNotEmptyI18n, IsStringI18n } from '~libs/common/i18n';

export class ProductIdParamsDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'A valid product id',
        example: '64eb328d9f1cee1867c00a8c',
    })
    @IsNotEmptyI18n()
    @IsMongoIdI18n()
    productId: string | Types.ObjectId;
}

export class ProductSkuQueryDTO {
    @ApiProperty({
        type: String,
        required: true,
        description: 'A valid product sku',
    })
    @IsNotEmptyI18n()
    @IsStringI18n()
    sku: string;
}
