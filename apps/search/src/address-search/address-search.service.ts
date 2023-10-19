import { GhnService } from '@app/third-party';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddressSearchService {
    constructor(private readonly ghnService: GhnService) {}

    async getProvinces() {
        return this.ghnService.getProvinces();
    }

    async getDistricts(provinceId: number) {
        return this.ghnService.getDistricts(provinceId);
    }

    async getWards(districtId: number) {
        return this.ghnService.getWards(districtId);
    }
}
