import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { RabbitMQService } from '~libs/common/RabbitMQ';
import { AttributesMntMessagePattern } from './attributes-mnt.pattern';
import { CreateAttributeDTO } from '@app/resource/attributes/dtos/create-attribute.dto';
import { AttributesMntService } from './attributes-mnt.service';

@Controller()
export class AttributesMntController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly attributeMntService: AttributesMntService,
    ) {}

    @MessagePattern(AttributesMntMessagePattern.createAttribute)
    async createAttribute(@Ctx() context: RmqContext, @Payload() payload: CreateAttributeDTO) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeMntService.createAttribute(payload);
    }

    @MessagePattern(AttributesMntMessagePattern.updateAttributeDescription)
    async updateAttributeDescription(
        @Ctx() context: RmqContext,
        @Payload()
        {
            attributeId,
            description,
            name,
        }: { attributeId: string; description: string; name: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeMntService.updateAttribute({
            attributeId,
            name,
            description,
        });
    }

    @MessagePattern(AttributesMntMessagePattern.deleteAttribute)
    async deleteAttribute(
        @Ctx() context: RmqContext,
        @Payload() { attributeId }: { attributeId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeMntService.deleteAttribute(attributeId);
    }
}
