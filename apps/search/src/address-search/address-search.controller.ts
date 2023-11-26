import { Controller } from '@nestjs/common';
import { AddressSearchService } from './address-search.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AddressSearchMessagePattern } from './address-search.pattern';
import { QueryDistrictsDTO, QueryWardsDTO } from './dtos';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Controller('address-search')
export class AddressSearchController {
    constructor(
        private readonly addressSearchService: AddressSearchService,
        private readonly rabbitMqService: RabbitMQService,
    ) {}

    @MessagePattern(AddressSearchMessagePattern.getProvinces)
    async getProvinces(@Ctx() context: RmqContext, @I18n() i18n: I18nContext<I18nTranslations>) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getProvinces(i18n);
    }

    @MessagePattern(AddressSearchMessagePattern.getDistricts)
    async getDistricts(
        @Ctx() context: RmqContext,
        @I18n() i18n: I18nContext<I18nTranslations>,
        @Payload() { province_id }: QueryDistrictsDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getDistricts(i18n, province_id);
    }

    @MessagePattern(AddressSearchMessagePattern.getWards)
    async getWards(
        @Ctx() context: RmqContext,
        @I18n() i18n: I18nContext<I18nTranslations>,
        @Payload() { district_id }: QueryWardsDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.addressSearchService.getWards(i18n, district_id);
    }
}
