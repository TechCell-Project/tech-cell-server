import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Query,
    Patch,
    UseGuards,
    Delete,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~/constants';
import { AdminGuard, catchException } from '@app/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    AttributesSearchMessagePattern,
    GetAttributesRequestDTO,
} from '~/apps/search/attributes-search';
import { CreateAttributeDTO } from '@app/resource/attributes/dtos/create-attribute.dto';
import { UpdateAttributeRequestDTO } from '~/apps/managements/attributes-mnt/dtos';
import { AttributesMntMessagePattern } from '~/apps/managements/attributes-mnt/attributes-mnt.pattern';
import { SelectDelete } from '~/apps/search/attributes-search/enums';

@ApiTags('attributes')
@Controller('/attributes')
export class AttributesController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    @Get('/')
    async getAttributes(@Query() requestQuery: GetAttributesRequestDTO) {
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributes, { ...requestQuery })
            .pipe(catchException());
    }

    @Get('/:attributeId')
    async getAttributeById(@Param('attributeId') attributeId: string) {
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributeById, { attributeId })
            .pipe(catchException());
    }

    @UseGuards(AdminGuard)
    @Post('/')
    async createAttribute(@Body() { label, name, description }: CreateAttributeDTO) {
        return this.managementsService
            .send(AttributesMntMessagePattern.createAttribute, { label, name, description })
            .pipe(catchException());
    }

    @UseGuards(AdminGuard)
    @Patch('/:attributeId')
    async updateAttributeDescription(
        @Param('attributeId') attributeId: string,
        @Body() { label, name, description }: UpdateAttributeRequestDTO,
    ) {
        return this.managementsService
            .send(AttributesMntMessagePattern.updateAttributeDescription, {
                attributeId,
                label,
                name,
                description,
            })
            .pipe(catchException());
    }

    @UseGuards(AdminGuard)
    @Delete('/:attributeId')
    async deleteAttribute(@Param('attributeId') attributeId: string) {
        return this.managementsService
            .send(AttributesMntMessagePattern.deleteAttribute, { attributeId })
            .pipe(catchException());
    }
}
