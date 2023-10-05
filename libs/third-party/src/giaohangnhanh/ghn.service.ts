import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { GhnCoreService } from './ghn.core.service';
import { AddressSchema } from '@app/resource/users/schemas/address.schema';
import { generateRegexQuery } from 'regex-vietnamese';

@Injectable()
export class GhnService extends GhnCoreService {
    constructor(protected readonly httpService: HttpService) {
        super(httpService, new Logger(GhnService.name));
    }

    public async calculateShippingFee(address: AddressSchema) {
        const provinceData = await this.getProvinces().catch((error) => {
            throw error;
        });
        const selectedProvince = provinceData.find((province) =>
            province.NameExtension.some((name) =>
                generateRegexQuery({ keyword: address.provinceLevel }).test(name),
            ),
        );

        const districtData = await this.getDistricts(selectedProvince.ProvinceID).catch((error) => {
            throw error;
        });
        const selectedDistrict = districtData.find((district) =>
            district.NameExtension.some((name) =>
                generateRegexQuery({ keyword: address.districtLevel }).test(name),
            ),
        );

        const wardData = await this.getWards(selectedDistrict.DistrictID).catch((error) => {
            throw error;
        });
        const selectedWard = wardData.find((ward) =>
            ward.NameExtension.some((name) =>
                generateRegexQuery({ keyword: address.wardLevel }).test(name),
            ),
        );

        return { selectedProvince, selectedDistrict, selectedWard };
    }
}
