export const CheckoutMessagePattern = {
    createOrder: { cmd: 'checkout_create_order' },
    reviewOrder: { cmd: 'checkout_review_order' },
    checkoutVnpay: { cmd: 'checkout_vnpay' },
    vnpayReturnUrl: { cmd: 'checkout_vnpay_return_url' },
    vnpayIpnUrl: { cmd: 'checkout_vnpay_ipn_url' },
    getUserOrders: { cmd: 'checkout_get_user_orders' },
    getUserOrderById: { cmd: 'checkout_get_user_order_by_id' },
    getPaymentUrl: { cmd: 'checkout_get_payment_url' },
    cancelUserOrder: { cmd: 'checkout_cancel_user_order' },
};
