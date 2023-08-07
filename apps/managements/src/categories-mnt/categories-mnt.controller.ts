import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext, Payload } from '@nestjs/microservices';
import { RabbitMQService } from '@app/common';
import { CategoriesMntMessagePattern } from './categories-mnt.pattern';
import { CategoriesMntService } from './categories-mnt.service';
import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO } from './dtos';

@Controller()
export class CategoriesMntController {
    constructor(
        private readonly rabbitMqService: RabbitMQService,
        private readonly attributeMntService: CategoriesMntService,
    ) {}

    @MessagePattern(CategoriesMntMessagePattern.createCategory)
    async createCategories(
        @Ctx() context: RmqContext,
        @Payload() payload: CreateCategoryRequestDTO,
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeMntService.createCategory(payload);
    }

    @MessagePattern(CategoriesMntMessagePattern.updateCategory)
    async updateCategory(
        @Ctx() context: RmqContext,
        @Payload()
        { categoryId, ...updateData }: UpdateCategoryRequestDTO & { categoryId: string },
    ) {
        this.rabbitMqService.acknowledgeMessage(context);
        return await this.attributeMntService.updateCategory({ categoryId, ...updateData });
    }
}
