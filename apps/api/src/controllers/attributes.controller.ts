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
import {
    AttributesSearchMessagePattern,
    GetAttributeByIdRequestDTO,
    GetAttributeByLabelRequestDTO,
    GetAttributesRequestDTO,
} from '~/apps/search/attributes-search';
import {
    DeleteAttributeByIdRequestDTO,
    UpdateAttributeRequestDTO,
} from '~/apps/managements/attributes-mnt/dtos';
import { AttributesMntMessagePattern } from '~/apps/managements/attributes-mnt/attributes-mnt.pattern';
import { CreateAttributeRequestDTO } from '~/apps/managements/attributes-mnt/dtos';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('attributes')
@Controller('/attributes')
export class AttributesController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    @ApiOkResponse({ description: 'Get attributes successfully!' })
    @ApiNotFoundResponse({ description: 'Attributes not found!' })
    @Get('/')
    async getAttributes(@Query() requestQuery: GetAttributesRequestDTO) {
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributes, { ...requestQuery })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get attribute by id successfully!' })
    @ApiNotFoundResponse({ description: 'Attribute not found!' })
    @Get('/:attributeId')
    async getAttributeById(@Param() { attributeId }: GetAttributeByIdRequestDTO) {
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributeById, { attributeId })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Get attribute by label successfully!' })
    @ApiNotFoundResponse({ description: 'Attribute not found!' })
    @Get('/label/:label')
    async getAttributesByLabel(@Param() { label }: GetAttributeByLabelRequestDTO) {
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributeByLabel, { label })
            .pipe(catchException());
    }

    @ApiCreatedResponse({ description: 'The attribute has been successfully created.' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @UseGuards(AdminGuard)
    @Post('/')
    async createAttribute(@Body() { label, name, description }: CreateAttributeRequestDTO) {
        return this.managementsService
            .send(AttributesMntMessagePattern.createAttribute, { label, name, description })
            .pipe(catchException());
    }

    @ApiOkResponse({ description: 'Update attribute description successfully!' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
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

    @ApiOkResponse({ description: 'Delete attribute successfully!' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @UseGuards(AdminGuard)
    @Delete('/:attributeId')
    async deleteAttribute(@Param() { attributeId }: DeleteAttributeByIdRequestDTO) {
        return this.managementsService
            .send(AttributesMntMessagePattern.deleteAttribute, { attributeId })
            .pipe(catchException());
    }
}
