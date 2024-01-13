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
    WAIT_FOR_PAYMENT = 'wait_for_payment',
    COMPLETED = 'completed',
    REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
    COD = 'COD',
    VNPAY = 'VNPAY',
    ATM = 'ATM',
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
    JCB = 'JCB',
}
