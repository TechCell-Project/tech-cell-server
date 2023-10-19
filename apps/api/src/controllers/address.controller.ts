import { catchException } from '@app/common';
import { GhnDistrictDTO } from '@app/third-party/giaohangnhanh/dtos/district.dto';
import { GhnProvinceDTO } from '@app/third-party/giaohangnhanh/dtos/province.dto';
import { GhnWardDTO } from '@app/third-party/giaohangnhanh/dtos/ward.dto';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressSearchMessagePattern } from '~/apps/search/address-search';
import { QueryDistrictsDTO, QueryWardsDTO } from '~/apps/search/address-search/dtos';
import { SEARCH_SERVICE } from '@app/common/constants/services.constant';

@ApiTags('address')
@Controller('address')
export class AddressController {
    constructor(@Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ) {}

    @Get('/provinces')
    @ApiOperation({ summary: 'Get provinces' })
    @ApiOkResponse({ description: 'Lấy danh sách tỉnh thành công.', type: [GhnProvinceDTO] })
    async getProvinces() {
        return this.searchService
            .send(AddressSearchMessagePattern.getProvinces, {})
            .pipe(catchException());
    }

    @Get('/districts/:province_id')
    @ApiOperation({ summary: 'Get districts' })
    @ApiOkResponse({ description: 'Lấy danh sách quận/huyện thành công.', type: [GhnDistrictDTO] })
    async getDistricts(@Param() { province_id }: QueryDistrictsDTO) {
        return this.searchService
            .send(AddressSearchMessagePattern.getDistricts, { province_id })
            .pipe(catchException());
    }

    @Get('/wards/:district_id')
    @ApiOperation({ summary: 'Get wards' })
    @ApiOkResponse({ description: 'Lấy danh sách phường/xã thành công.', type: [GhnWardDTO] })
    async getWards(@Param() { district_id }: QueryWardsDTO) {
        return this.searchService
            .send(AddressSearchMessagePattern.getWards, { district_id })
            .pipe(catchException());
    }
}
