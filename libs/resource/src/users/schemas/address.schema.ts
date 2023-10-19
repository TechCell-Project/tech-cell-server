import { Prop } from '@nestjs/mongoose';

export class ProvinceSchema {
    @Prop({ type: Number })
    province_id: number;

    @Prop({ type: String })
    province_name: string;
}

export class DistrictSchema {
    @Prop({ type: Number })
    district_id: number;

    @Prop({ type: String })
    district_name: string;
}

export class WardSchema {
    @Prop({ type: String })
    ward_id: string;

    @Prop({ type: String })
    ward_name: string;
}

export class AddressSchema {
    @Prop({ type: String })
    addressName: string;

    @Prop({ type: String })
    customerName: string;

    @Prop({ type: String })
    phoneNumbers: string;

    @Prop({ type: ProvinceSchema })
    provinceLevel: ProvinceSchema;

    @Prop({ type: DistrictSchema })
    districtLevel: DistrictSchema;

    @Prop({ type: WardSchema })
    wardLevel: WardSchema;

    @Prop({ type: String })
    detail: string;

    @Prop({ type: Boolean, default: false })
    isDefault: boolean;
}
