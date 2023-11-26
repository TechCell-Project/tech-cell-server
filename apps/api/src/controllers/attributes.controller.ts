import {
    Body,
    Controller,
    Get,
    Inject,
    Headers,
    Param,
    Post,
    Query,
    Patch,
    UseGuards,
    Delete,
} from '@nestjs/common';
import { ClientRMQ, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
import { AdminGuard, catchException } from '~libs/common';
import {
    AttributesSearchMessagePattern,
    GetAttributeByIdRequestDTO,
    GetAttributeByLabelRequestDTO,
    GetAttributesRequestDTO,
    ListAttributeResponseDTO,
} from '~apps/search/attributes-search';
import {
    DeleteAttributeByIdRequestDTO,
    UpdateAttributeRequestDTO,
    CreateAttributeRequestDTO,
} from '~apps/managements/attributes-mnt/dtos';
import { AttributesMntMessagePattern } from '~apps/managements/attributes-mnt/attributes-mnt.pattern';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AttributeDTO } from '~libs/resource/attributes/dtos';

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
@ApiTags('attributes')
@Controller('/attributes')
export class AttributesController {
    constructor(
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Get list of attribute',
        description: 'Get list of attribute',
    })
    @ApiOkResponse({
        type: ListAttributeResponseDTO,
        description: 'Get attributes successfully!',
    })
    @ApiNotFoundResponse({ description: 'Attributes not found!' })
    @Get('/')
    async getAttributes(
        @Headers() headers: Record<string, string>,
        @Query() requestQuery: GetAttributesRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData(requestQuery)
            .build();
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributes, record)
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get attribute by id',
        description: 'Get attribute by id',
    })
    @ApiOkResponse({ description: 'Get attribute by id successfully!', type: AttributeDTO })
    @ApiNotFoundResponse({ description: 'Attribute not found!' })
    @Get('/:attributeId')
    async getAttributeById(
        @Headers() headers: Record<string, string>,
        @Param() { attributeId }: GetAttributeByIdRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData({ attributeId })
            .build();
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributeById, record)
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Get attribute by label',
        description: 'Get attribute by label',
    })
    @ApiOkResponse({ description: 'Get attribute by label successfully!' })
    @ApiNotFoundResponse({ description: 'Attribute not found!' })
    @Get('/label/:label')
    async getAttributesByLabel(
        @Headers() headers: Record<string, string>,
        @Param() { label }: GetAttributeByLabelRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData({ label })
            .build();
        return this.searchService
            .send(AttributesSearchMessagePattern.getAttributeByLabel, record)
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Create attribute',
        description: 'Create attribute',
    })
    @ApiCreatedResponse({ description: 'The attribute has been successfully created.' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @UseGuards(AdminGuard)
    @Post('/')
    async createAttribute(
        @Headers() headers: Record<string, string>,
        @Body() { label, name, description }: CreateAttributeRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData({ label, name, description })
            .build();
        return this.managementsService
            .send(AttributesMntMessagePattern.createAttribute, record)
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Update attribute',
        description: 'Update attribute',
    })
    @ApiOkResponse({ description: 'Update attribute description successfully!' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @UseGuards(AdminGuard)
    @Patch('/:attributeId')
    async updateAttributeInfo(
        @Headers() headers: Record<string, string>,
        @Param('attributeId') attributeId: string,
        @Body() { label, name, description }: UpdateAttributeRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData({ attributeId, label, name, description })
            .build();
        return this.managementsService
            .send(AttributesMntMessagePattern.updateAttributeInfo, record)
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Delete attribute',
        description: 'Delete attribute',
    })
    @ApiOkResponse({ description: 'Delete attribute successfully!' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @UseGuards(AdminGuard)
    @Delete('/:attributeId')
    async deleteAttribute(
        @Headers() headers: Record<string, string>,
        @Param() { attributeId }: DeleteAttributeByIdRequestDTO,
    ) {
        const record: RmqRecord = new RmqRecordBuilder()
            .setOptions({ headers: headers })
            .setData({ attributeId })
            .build();
        return this.managementsService
            .send(AttributesMntMessagePattern.deleteAttribute, record)
            .pipe(catchException());
    }
}
