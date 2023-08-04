import { Controller } from '@nestjs/common';
import { RabbitMQService } from '@app/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CategoriesSearchService } from './categories-search.service';
import { CategoriesSearchMessagePattern } from './categories-search.pattern';
import { GetCategoriesRequestDTO } from './dtos';

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

    // @MessagePattern(CategoriesSearchMessagePattern.getCategoryById)
    // async getCategoryById(
    //     @Ctx() context: RmqContext,
    //     @Payload() { categoryId }: { categoryId: string },
    // ) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return await this.categoriesSearchService.getCategoryById(categoryId);
    // }

    // @MessagePattern(CategoriesSearchMessagePattern.getCategoriesByAttributeId)
    // async getCategoriesByAttributeId(
    //     @Ctx() context: RmqContext,
    //     @Payload() { attributeId }: { attributeId: string },
    // ) {
    //     this.rabbitMqService.acknowledgeMessage(context);
    //     return await this.categoriesSearchService.getCategoriesByAttributeId(attributeId);
    // }
}
