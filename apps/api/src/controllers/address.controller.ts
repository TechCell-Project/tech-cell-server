import { catchException } from '~libs/common';
import { GhnDistrictDTO } from '~libs/third-party/giaohangnhanh/dtos/district.dto';
import { GhnProvinceDTO } from '~libs/third-party/giaohangnhanh/dtos/province.dto';
import { GhnWardDTO } from '~libs/third-party/giaohangnhanh/dtos/ward.dto';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AddressSearchMessagePattern } from '~apps/search/address-search';
import { QueryDistrictsDTO, QueryWardsDTO } from '~apps/search/address-search/dtos';
import { SEARCH_SERVICE } from '~libs/common/constants/services.constant';

@ApiBadRequestResponse({
    description: 'Invalid request, please check your request data!',
})
@ApiNotFoundResponse({
    description: 'Not found data, please try again!',
})
@ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later!',
})
@ApiInternalServerErrorResponse({
    description: 'Internal server error, please try again later!',
})
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
