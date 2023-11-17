import { AdminGuard, catchException } from '~libs/common';
import { PaginationQuery } from '~libs/common/dtos';
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import {
    ApiBearerAuth,
    ApiExcludeController,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { DiscountsMntMessagePattern } from '~apps/managements/discounts-mnt';
import { CreateDiscountRequestDTO } from '~apps/managements/discounts-mnt/dtos';
import { ACCESS_TOKEN_NAME, MANAGEMENTS_SERVICE } from '~libs/common/constants';

// TODO: Need implement
@ApiExcludeController()
@ApiTags('discounts')
@Controller('discounts')
@ApiBearerAuth(ACCESS_TOKEN_NAME)
// @UseGuards(AdminGuard)
export class DiscountsController {
    constructor(@Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ) {}

    @ApiOperation({
        summary: 'Get list of discounts',
        description: 'Get list of discounts',
    })
    @ApiOkResponse({ description: 'Discounts found!' })
    @Get('/')
    async getDiscounts(@Query() query: PaginationQuery) {
        return this.managementsService
            .send(DiscountsMntMessagePattern.createDiscount, { query })
            .pipe(catchException());
    }

    @ApiOperation({
        summary: 'Create new discount',
        description: 'Create new discount',
    })
    @Post('/')
    async createDiscount(@Body() data: CreateDiscountRequestDTO) {
        return this.managementsService
            .send(DiscountsMntMessagePattern.createDiscount, { data })
            .pipe(catchException());
    }
}
