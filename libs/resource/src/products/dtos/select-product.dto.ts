import { PickType } from '@nestjs/swagger';
import { ProductDTO, ProductVariationDTO } from './product.dto';
import { Types } from 'mongoose';
import { IsMongoId, ValidateNested } from 'class-validator';

export class SelectProduct extends PickType(ProductDTO, ['_id', 'variations']) {
    @IsMongoId()
    _id: Types.ObjectId;

    @ValidateNested({ each: true })
    variations: ProductVariationDTO[];
}
