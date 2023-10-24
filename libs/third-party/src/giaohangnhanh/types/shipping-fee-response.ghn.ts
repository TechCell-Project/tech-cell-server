export type TShippingFeeResponse = {
    total: number;
    service_fee: number;
    insurance_fee: number;
    [key: string]: number;
};
