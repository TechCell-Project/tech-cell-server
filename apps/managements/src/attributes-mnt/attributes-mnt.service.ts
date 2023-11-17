import { AttributesService } from '@app/resource/attributes';
import { Inject, Injectable } from '@nestjs/common';
import { Store } from 'cache-manager';
import { REDIS_CACHE } from '~libs/common/constants';
import { CreateAttributeDTO, UpdateAttributeDTO } from '@app/resource/attributes/dtos';

@Injectable()
export class AttributesMntService {
    constructor(
        private readonly attributesService: AttributesService,
        @Inject(REDIS_CACHE) private cacheManager: Store,
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
