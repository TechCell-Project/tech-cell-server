import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { AttributesSearchMessagePattern } from './attributes-search.pattern';
import { GetAttributesRequestDTO } from './dtos';
import { AttributesSearchService } from './attributes-search.service';

@Controller()
export class AttributesSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly attributeSearchService: AttributesSearchService,
    ) {}

    @MessagePattern(AttributesSearchMessagePattern.getAttributes)
    async getAttributes(
        @Ctx() context: RmqContext,
        @Payload() requestQuery: GetAttributesRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeSearchService.getAttributes({ ...requestQuery });
    }

    @MessagePattern(AttributesSearchMessagePattern.getAttributeById)
    async getAttributeById(
        @Ctx() context: RmqContext,
        @Payload() { attributeId }: { attributeId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeSearchService.getAttributeById(attributeId);
    }

    @MessagePattern(AttributesSearchMessagePattern.getAttributeByLabel)
    async getAttributeByLabel(@Ctx() context: RmqContext, @Payload() { label }: { label: string }) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeSearchService.getAttributeByLabel(label);
    }
}
