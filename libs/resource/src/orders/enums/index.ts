export enum OrderStatusEnum {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    PROCESSING = 'processing',
    SHIPPING = 'shipping',
    COMPLETED = 'completed',
    REFUNDED = 'refunded',
}

export enum PaymentStatusEnum {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
    COD = 'COD',
    VNPAY = 'VNPAY',
}
