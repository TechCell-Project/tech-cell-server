import { Controller, Get } from '@nestjs/common';
import { ManagamentsService } from './managaments.service';

@Controller()
export class ManagamentsController {
    constructor(private readonly managamentsService: ManagamentsService) {}

    @Get()
    getHello(): string {
        return this.managamentsService.getHello();
    }
}
