import { Inject, Injectable, Logger } from '@nestjs/common';
import { AddressSchema } from '~libs/resource/users/schemas/address.schema';
import { generateRegexQuery } from 'regex-vietnamese';
import { GetShippingFeeDTO, ItemShipping } from './dtos/get-shipping-fee.dto';
import Ghn, { GhnConfig } from 'giaohangnhanh';
import { GhnDistrictDTO, GhnProvinceDTO, GhnWardDTO } from './dtos';

@Injectable()
export class GhnService {
    private readonly ghnInstance: Ghn;
    private readonly logger: Logger;

    constructor(@Inject('GHN_INIT_OPTIONS') private readonly config: GhnConfig) {
        this.ghnInstance = new Ghn(this.config);
        this.logger = new Logger(GhnService.name);
    }

    public async getProvinces() {
        return (await this.ghnInstance.address.getProvinces()).map((p) => new GhnProvinceDTO(p));
    }

    public async getDistricts(provinceId: number) {
        return (await this.ghnInstance.address.getDistricts(provinceId)).map(
            (d) => new GhnDistrictDTO(d),
        );
    }

    public async getWards(districtId: number) {
        return (await this.ghnInstance.address.getWards(districtId)).map((w) => new GhnWardDTO(w));
    }

    public async calculateShippingFee({
        address,
        items,
    }: {
        address: AddressSchema;
        items: ItemShipping[];
    }) {
        const { selectedDistrict, selectedWard } = await this.getSelectedAddress(address);

        const integerItems = items.map((item) => ({
            ...item,
            weight: Math.floor(item.weight),
            height: Math.floor(item.height / 10),
            length: Math.floor(item.length / 10),
            width: Math.floor(item.width / 10),
            quantity: Math.floor(item.quantity),
        }));
        const [weight, height, length, width] = integerItems.reduce(
            (acc, item) => {
                return [
                    acc[0] + item.weight * item.quantity,
                    acc[1] + item.height * item.quantity,
                    acc[2] + item.length * item.quantity,
                    acc[3] + item.width * item.quantity,
                ];
            },
            [0, 0, 0, 0],
        );

        const dataFee = new GetShippingFeeDTO({
            service_type_id: 2,
            to_district_id: selectedDistrict.district_id,
            to_ward_code: selectedWard.ward_code,
            items: integerItems,
            province_id: selectedDistrict.province_id,
            weight,
            height,
            length,
            width,
        });

        const fee = await this.ghnInstance.calculateFee
            .calculateShippingFee(dataFee)
            .catch((error) => {
                throw error;
            });

        return fee;
    }

    // Utils
    private async getSelectedAddress(address: AddressSchema) {
        const provinceData = await this.getProvinces().catch((error) => {
            throw error;
        });
        const selectedProvince = provinceData.find(
            (province) =>
                province.name_extension?.some((name) =>
                    generateRegexQuery(address.provinceLevel.province_name).test(name),
                ),
        );

        const districtData = await this.getDistricts(selectedProvince.province_id).catch(
            (error) => {
                throw error;
            },
        );
        const selectedDistrict = districtData.find(
            (district) =>
                district.name_extension?.some((name) =>
                    generateRegexQuery(address.districtLevel.district_name).test(name),
                ),
        );

        const wardData = await this.getWards(selectedDistrict.district_id).catch((error) => {
            throw error;
        });
        const selectedWard = wardData.find(
            (ward) =>
                ward.name_extension?.some((name) =>
                    generateRegexQuery(address.wardLevel.ward_name).test(name),
                ),
        );

        return { selectedProvince, selectedDistrict, selectedWard };
    }
}
