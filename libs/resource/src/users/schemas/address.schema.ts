import { Prop } from '@nestjs/mongoose';

export class AddressSchema {
    @Prop({ type: String })
    addressName: string;

    @Prop({ type: String })
    customerName: string;

    @Prop({ type: String })
    phoneNumbers: string;

    @Prop({ type: String })
    provinceLevel: string;

    @Prop({ type: String })
    districtLevel: string;

    @Prop({ type: String })
    wardLevel: string;

    @Prop({ type: String })
    detail: string;

    @Prop({ type: Boolean, default: false })
    isDefault: boolean;
}
