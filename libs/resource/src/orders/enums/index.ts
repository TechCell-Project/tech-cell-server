export enum OrderStatusEnum {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
    SHIPPING = 'shipping',
}

export enum PaymentStatusEnum {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
    COD = 'COD',
    VNPAY = 'VNPAY',
}
