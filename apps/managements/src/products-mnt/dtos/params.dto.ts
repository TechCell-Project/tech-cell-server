import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class ProductIdParamsDTO {
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid product id' })
    productId: Types.ObjectId;
}
