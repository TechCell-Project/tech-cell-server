import { Types } from 'mongoose';

export class ProductCart {
    productId: Types.ObjectId;
    sku: string;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}
