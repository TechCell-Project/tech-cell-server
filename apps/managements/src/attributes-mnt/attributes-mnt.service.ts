import { AttributesService } from '~libs/resource/attributes';
import { Injectable } from '@nestjs/common';
import { CreateAttributeDTO, UpdateAttributeDTO } from '~libs/resource/attributes/dtos';
import { RedisService } from '~libs/common/Redis';

@Injectable()
export class AttributesMntService {
    constructor(
        private readonly attributesService: AttributesService,
        private redisService: RedisService,
    ) {}

    async createAttribute({ label, name, description }: CreateAttributeDTO) {
        return await this.attributesService.createAttribute({ label, name, description });
    }

    async updateAttribute({ attributeId, description, name }: UpdateAttributeDTO) {
        return await this.attributesService.updateAttribute({ attributeId, name, description });
    }

    async deleteAttribute(attributeId: string) {
        return await this.attributesService.deleteAttribute(attributeId);
    }
}
