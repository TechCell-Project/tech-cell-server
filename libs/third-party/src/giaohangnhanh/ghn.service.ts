import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { GhnCoreService } from './ghn.core.service';
import { AddressSchema } from '@app/resource/users/schemas/address.schema';
import { generateRegexQuery } from 'regex-vietnamese';
import { GetShippingFeeDTO, ItemShipping } from './dtos/get-shipping-fee.dto';

@Injectable()
export class GhnService extends GhnCoreService {
    constructor(protected readonly httpService: HttpService) {
        super(httpService, new Logger(GhnService.name));
    }

    public async calculateShippingFee({ address }: { address: AddressSchema }) {
        const { selectedProvince, selectedDistrict, selectedWard } = await this.getSelectedAddress(
            address,
        );

        const itemFee = new ItemShipping({
            name: 'TEST1',
            quantity: 1,
            height: 200,
            weight: 1000,
            length: 200,
            width: 200,
        });
        const dataFee = new GetShippingFeeDTO({
            service_type_id: 2,
            to_district_id: selectedDistrict.DistrictID,
            to_ward_code: selectedWard.WardCode,
            weight: 1000,
            items: [itemFee],
        });
        const fee = await this.getShippingFee(dataFee).catch((error) => {
            this.logger.error(error);
        });

        return { fee };
    }

    // Utils
    private async getSelectedAddress(address: AddressSchema) {
        const provinceData = await this.getProvinces().catch((error) => {
            throw error;
        });
        const selectedProvince = provinceData.find((province) =>
            province.NameExtension.some((name) =>
                generateRegexQuery(address.provinceLevel).test(name),
            ),
        );

        const districtData = await this.getDistricts(selectedProvince.ProvinceID).catch((error) => {
            throw error;
        });
        const selectedDistrict = districtData.find((district) =>
            district.NameExtension.some((name) =>
                generateRegexQuery(address.districtLevel).test(name),
            ),
        );

        const wardData = await this.getWards(selectedDistrict.DistrictID).catch((error) => {
            throw error;
        });
        const selectedWard = wardData.find((ward) =>
            ward.NameExtension.some((name) => generateRegexQuery(address.wardLevel).test(name)),
        );

        return { selectedProvince, selectedDistrict, selectedWard };
    }
}
