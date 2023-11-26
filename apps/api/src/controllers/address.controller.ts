import { GhnDistrictDTO } from '~libs/third-party/giaohangnhanh/dtos/district.dto';
import { GhnProvinceDTO } from '~libs/third-party/giaohangnhanh/dtos/province.dto';
import { GhnWardDTO } from '~libs/third-party/giaohangnhanh/dtos/ward.dto';
import { Controller, Get, Inject, Param, Headers } from '@nestjs/common';
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
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';

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
    async getProvinces(@Headers() headers: Record<string, any>) {
        return sendMessagePipeException({
            client: this.searchService,
            pattern: AddressSearchMessagePattern.getProvinces,
            data: {},
            headers,
        });
    }

    @Get('/districts/:province_id')
    @ApiOperation({ summary: 'Get districts' })
    @ApiOkResponse({ description: 'Lấy danh sách quận/huyện thành công.', type: [GhnDistrictDTO] })
    async getDistricts(
        @Headers() headers: Record<string, any>,
        @Param() { province_id }: QueryDistrictsDTO,
    ) {
        return sendMessagePipeException({
            client: this.searchService,
            pattern: AddressSearchMessagePattern.getDistricts,
            data: { province_id },
            headers,
        });
    }

    @Get('/wards/:district_id')
    @ApiOperation({ summary: 'Get wards' })
    @ApiOkResponse({ description: 'Lấy danh sách phường/xã thành công.', type: [GhnWardDTO] })
    async getWards(
        @Headers() headers: Record<string, any>,
        @Param() { district_id }: QueryWardsDTO,
    ) {
        return sendMessagePipeException({
            client: this.searchService,
            pattern: AddressSearchMessagePattern.getWards,
            data: { district_id },
            headers,
        });
    }
}
