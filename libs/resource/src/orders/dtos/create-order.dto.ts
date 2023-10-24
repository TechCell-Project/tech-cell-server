import { Types } from 'mongoose';
import { Order } from '../schemas/order.schema';
import {
    CheckoutOrderSchema,
    PaymentOrder,
    ProductOrderSchema,
    ShippingOrderSchema,
} from '../schemas/sub-order.schema';
import { AddressSchemaDTO } from '@app/resource/users/dtos';

class ProductOrderDTO implements ProductOrderSchema {
    productId: Types.ObjectId;
    sku: string;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class CheckoutOrderDTO implements CheckoutOrderSchema {
    totalPrice: number;
    totalApplyDiscount: number;
    shippingFee: number;
}

class ShippingOrderDTO implements ShippingOrderSchema {
    fromAddress?: AddressSchemaDTO;
    toAddress?: AddressSchemaDTO;
}

class PaymentOrderDTO implements PaymentOrder {
    provider: string;
    status: string;
}

export class CreateOrderDTO implements Omit<Order, '_id'> {
    constructor(data: CreateOrderDTO) {
        this.userId = data.userId;
        this.products = data.products;
        this.checkoutOrder = data.checkoutOrder;
        this.shippingOrder = data.shippingOrder;
        this.paymentOrder = data?.paymentOrder;
        this.trackingCode = data.trackingCode;
        this.orderStatus = data.orderStatus;
    }

    userId: Types.ObjectId;
    products: Array<ProductOrderDTO>;
    checkoutOrder: CheckoutOrderDTO;
    shippingOrder: ShippingOrderDTO;
    paymentOrder?: PaymentOrderDTO;
    trackingCode: string;
    orderStatus: string;
}
