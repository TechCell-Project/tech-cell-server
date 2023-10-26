export enum OrderStatus {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
    SHIPPING = 'shipping',
}

export enum PaymentStatus {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
    COD = 'COD',
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
}
