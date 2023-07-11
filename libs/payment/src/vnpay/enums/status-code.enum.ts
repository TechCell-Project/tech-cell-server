/**
 * TransactionStatus of VNPAY payment
 * (Mã trạng thái của thanh toán VNPAY)
 * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#Bang-ma-loi-PAY
 */
export enum TransactionStatus {
    Success = '00',
    Pending = '01',
    Error = '02',
    Reverse = '04',
    Processing = '05',
    RequiredRefund = '06',
    DoubtCheating = '07',
    RefundReject = '09',
}

export enum ResponseCode {
    Success = '00',
    DoubtCheating = '07',
    NotInternetBanking = '09',
    ExceedWrongTime = '10',
    ExceedTime = '11',
    CardIsBlocked = '12',
    WrongOTP = '13',
    CustomerCancel = '24',
    NotEnoughMoney = '51',
    CardIsExceedLimitMoney = '65',
    BankIsUnderMaintenance = '75',
    ExceedWrongPasswordTime = '79',
    OtherError = '99',
}
