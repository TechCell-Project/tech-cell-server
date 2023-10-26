export const CheckoutMessagePattern = {
    createOrder: { cmd: 'checkout_create_order' },
    reviewOrder: { cmd: 'checkout_review_order' },
    checkoutVnpay: { cmd: 'checkout_vnpay' },
    vnpayReturnUrl: { cmd: 'checkout_vnpay_return_url' },
    vnpayIpnUrl: { cmd: 'checkout_vnpay_ipn_url' },
    getAllUserOrders: { cmd: 'checkout_get_all_user_orders' },
};
