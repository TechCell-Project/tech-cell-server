import { IsEnum, IsNumber, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { ProductStatus } from '@app/resource/products/enums';

export class ChangeStatusDTO {
    @IsNotEmpty()
    @IsMongoId()
    productId: string | Types.ObjectId;

    @IsNotEmpty()
    @IsEnum(ProductStatus)
    @IsNumber()
    status: number;
}
