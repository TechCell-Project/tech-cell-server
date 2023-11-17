import { Controller } from '@nestjs/common';
import { AddressSearchService } from './address-search.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AddressSearchMessagePattern } from './address-search.pattern';
import { QueryDistrictsDTO, QueryWardsDTO } from './dtos';
import { RabbitMQService } from '~libs/common/RabbitMQ';

@Controller('address-search')
export class AddressSearchController {
    constructor(
        private readonly addressSearchService: AddressSearchService,
        private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern(AddressSearchMessagePattern.getProvinces)
    async getProvinces(@Ctx() context: RmqContext) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getProvinces();
    }

    @MessagePattern(AddressSearchMessagePattern.getDistricts)
    async getDistricts(@Ctx() context: RmqContext, @Payload() { province_id }: QueryDistrictsDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getDistricts(province_id);
    }

    @MessagePattern(AddressSearchMessagePattern.getWards)
    async getWards(@Ctx() context: RmqContext, @Payload() { district_id }: QueryWardsDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getWards(district_id);
    }
}
