import { Controller, Inject, Get, Query, Post, Body, Patch, Param, Headers } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { MANAGEMENTS_SERVICE, SEARCH_SERVICE } from '~libs/common/constants';
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
import {
    CategoriesSearchMessagePattern,
    GetCategoriesRequestDTO,
    GetCategoryByLabelRequestDTO,
    ListCategoryResponseDTO,
} from '~apps/search/categories-search';
import {
    CategoriesMntMessagePattern,
    CreateCategoryRequestDTO,
    UpdateCategoryRequestDTO,
} from '~apps/managements/categories-mnt';
import { CategoryDTO, CategoryIdParam } from '~libs/resource/categories/dtos';
import { sendMessagePipeException } from '~libs/common/RabbitMQ/rmq.util';
import { THeaders } from '~libs/common/types/common.type';
import { Auth } from '~libs/common/decorators';
import { UserRole } from '~libs/resource/users/enums';

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
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Get list of categories',
        description: 'Get list of categories',
    })
    @ApiOkResponse({ description: 'Get categories successfully!', type: ListCategoryResponseDTO })
    @ApiNotFoundResponse({ description: 'Categories not found!' })
    @Get('/')
    async getCategories(@Headers() headers: THeaders, @Query() query: GetCategoriesRequestDTO) {
        return sendMessagePipeException<GetCategoriesRequestDTO>({
            client: this.searchService,
            pattern: CategoriesSearchMessagePattern.getCategories,
            data: { ...query },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Get category by id',
        description: 'Get category by id',
    })
    @ApiOkResponse({ description: 'Get category successfully!', type: CategoryDTO })
    @ApiNotFoundResponse({ description: 'Category not found!' })
    @Get(':categoryId')
    async getCategoryById(@Headers() headers: THeaders, @Param() { categoryId }: CategoryIdParam) {
        return sendMessagePipeException<CategoryIdParam>({
            client: this.searchService,
            pattern: CategoriesSearchMessagePattern.getCategoryById,
            data: { categoryId },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Get category by label',
        description: 'Get category by label',
    })
    @ApiOkResponse({ description: 'Get category successfully!', type: CategoryDTO })
    @ApiNotFoundResponse({ description: 'Category not found!' })
    @Get('/label/:label')
    async getCategoryByLabel(
        @Headers() headers: THeaders,
        @Param() { label }: GetCategoryByLabelRequestDTO,
    ) {
        return sendMessagePipeException<GetCategoryByLabelRequestDTO>({
            client: this.searchService,
            pattern: CategoriesSearchMessagePattern.getCategoryByLabel,
            data: { label },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Create category',
        description: 'Create category',
    })
    @ApiCreatedResponse({ description: 'The category has been successfully created.' })
    @ApiBadRequestResponse({ description: 'Something wrong, re-check your input.' })
    @Post('/')
    async createCategory(@Headers() headers: THeaders, @Body() data: CreateCategoryRequestDTO) {
        return sendMessagePipeException<CreateCategoryRequestDTO>({
            client: this.managementsService,
            pattern: CategoriesMntMessagePattern.createCategory,
            data: { ...data },
            headers,
        });
    }

    @ApiOperation({
        summary: 'Update category',
        description: 'Update category',
    })
    @Auth(UserRole.Staff)
    @Patch('/:categoryId')
    async updateCategory(
        @Headers() headers: THeaders,
        @Param() { categoryId }: CategoryIdParam,
        @Body() data: UpdateCategoryRequestDTO,
    ) {
        return sendMessagePipeException<UpdateCategoryRequestDTO & CategoryIdParam>({
            client: this.managementsService,
            pattern: CategoriesMntMessagePattern.updateCategory,
            data: { categoryId, ...data },
            headers,
        });
    }
}
