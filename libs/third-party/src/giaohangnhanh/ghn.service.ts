import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { GhnCoreService } from './ghn.core.service';
import { AddressSchema } from '~libs/resource/users/schemas/address.schema';
import { generateRegexQuery } from 'regex-vietnamese';
import { GetShippingFeeDTO, ItemShipping } from './dtos/get-shipping-fee.dto';

@Injectable()
export class GhnService extends GhnCoreService {
    constructor(protected readonly httpService: HttpService) {
        super(httpService, new Logger(GhnService.name));
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
            height: Math.floor(item.height),
            length: Math.floor(item.length),
            width: Math.floor(item.width),
            quantity: Math.floor(item.quantity),
        }));
        const totalWeight = integerItems.reduce((total, item) => {
            return total + item.weight * item.quantity;
        }, 0);
        const dataFee = new GetShippingFeeDTO({
            service_type_id: 2,
            to_district_id: selectedDistrict.district_id,
            to_ward_code: selectedWard.ward_code,
            weight: totalWeight,
            items: integerItems,
            province_id: selectedDistrict.province_id,
        });
        const fee = await this.getShippingFee(dataFee).catch((error) => {
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
