export enum OrderStatus {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
    SHIPPING = 'shipping',
}

export enum PaymentProvider {
    VNPAY = 'vnpay',
    PAYPAL = 'paypal',
    MOMO = 'momo',
    ZALOPAY = 'zalopay',
    CASH = 'cash',
}

export enum PaymentStatus {
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    PROCESSING = 'processing',
    REFUNDED = 'refunded',
}
