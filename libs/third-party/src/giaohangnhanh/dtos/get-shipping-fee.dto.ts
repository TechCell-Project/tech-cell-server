import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ItemShipping {
    constructor(partial: ItemShipping) {
        this.name = partial.name;
        this.quantity = partial.quantity;
        this.height = partial.height;
        this.weight = partial.weight;
        this.width = partial.width;
        this.length = partial.length;
        this.code = partial?.code ? partial.code : undefined;
    }

    name: string;
    code?: string;
    quantity: number;
    height: number;
    weight: number;
    width: number;
    length: number;
}

export class GetShippingFeeDTO {
    constructor(data: GetShippingFeeDTO) {
        this.service_type_id = data?.service_type_id;
        this.from_district_id = data?.from_district_id;
        this.from_ward_code = data?.from_ward_code;
        this.to_district_id = data?.to_district_id;
        this.to_ward_code = data?.to_ward_code;
        this.height = data?.height;
        this.weight = data?.weight;
        this.width = data?.width;
        this.length = data?.length;
        this.insurance_value = data?.insurance_value;
        this.items = data?.items.map((item) => new ItemShipping(item));
        this.province_id = data?.province_id;
    }

    @IsOptional()
    @IsNumber()
    service_type_id?: number;

    @IsNumber()
    from_district_id?: number;

    @IsOptional()
    from_ward_code?: string;

    @IsNumber()
    to_district_id: number;

    @IsString()
    to_ward_code: string;

    height?: number;
    weight?: number;
    width?: number;
    length?: number;

    insurance_value?: number;
    items: ItemShipping[];

    province_id?: number;
}
