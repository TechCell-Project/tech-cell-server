import { Prop } from '@nestjs/mongoose';

export class AddressSchema {
    @Prop({ type: String })
    provinceLevel: string;

    @Prop({ type: String })
    districtLevel: string;

    @Prop({ type: String })
    wardLevel: string;

    @Prop({ type: String })
    detail?: string;
}
