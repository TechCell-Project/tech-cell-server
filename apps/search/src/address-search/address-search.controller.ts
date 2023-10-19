import { Controller } from '@nestjs/common';
import { AddressSearchService } from './address-search.service';
import { MessagePattern } from '@nestjs/microservices';
import { AddressSearchMessagePattern } from './address-search.pattern';
import { QueryDistrictsDTO, QueryWardsDTO } from './dtos';

@Controller('address-search')
export class AddressSearchController {
    constructor(private readonly addressSearchService: AddressSearchService) {}

    @MessagePattern(AddressSearchMessagePattern.getProvinces)
    async getProvinces() {
        return this.addressSearchService.getProvinces();
    }

    @MessagePattern(AddressSearchMessagePattern.getDistricts)
    async getDistricts({ province_id }: QueryDistrictsDTO) {
        return this.addressSearchService.getDistricts(province_id);
    }

    @MessagePattern(AddressSearchMessagePattern.getWards)
    async getWards({ district_id }: QueryWardsDTO) {
        return this.addressSearchService.getWards(district_id);
    }
}
