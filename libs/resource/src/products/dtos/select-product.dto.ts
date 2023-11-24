import { PickType } from '@nestjs/swagger';
import { ProductDTO, ProductVariationDTO } from './product.dto';
import { Types } from 'mongoose';
import { ValidateNested } from 'class-validator';
import { IsMongoIdI18n } from '~libs/common/i18n';

export class SelectProduct extends PickType(ProductDTO, ['_id', 'variations']) {
    @IsMongoIdI18n()
    _id: Types.ObjectId;

    @ValidateNested({ each: true })
    variations: ProductVariationDTO[];
}
