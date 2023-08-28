import { Types } from 'mongoose';

export interface IGetCartByProduct {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    sku: string;
}
