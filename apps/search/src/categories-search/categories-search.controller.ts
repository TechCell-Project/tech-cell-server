import { Controller } from '@nestjs/common';
import { RabbitMQService } from '@app/common/RabbitMQ';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchMessagePattern } from './categories-search.pattern';
import { GetCategoriesRequestDTO, GetCategoryByLabelRequestDTO } from './dtos';
import { CategoryIdParam } from '@app/resource/categories/dtos';

@Controller()
export class CategoriesSearchController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly categoriesSearchService: CategoriesSearchService,
    ) {}

    @MessagePattern(CategoriesSearchMessagePattern.getCategories)
    async getCategories(
        @Ctx() context: RmqContext,
        @Payload() { ...requestQuery }: GetCategoriesRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.categoriesSearchService.getCategories({ ...requestQuery });
    }

    @MessagePattern(CategoriesSearchMessagePattern.getCategoryByLabel)
    async getCategoryByLabel(
        @Ctx() context: RmqContext,
        @Payload() { label }: GetCategoryByLabelRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.categoriesSearchService.getCategoryByLabel(label);
    }

    @MessagePattern(CategoriesSearchMessagePattern.getCategoryById)
    async getCategoryById(@Ctx() context: RmqContext, @Payload() { categoryId }: CategoryIdParam) {
        this.rabbitMqService.acknowledgeMessage(context);
        return this.categoriesSearchService.getCategoryById({ categoryId });
    }
}
