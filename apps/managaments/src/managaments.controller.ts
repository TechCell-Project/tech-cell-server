import { Controller, Get } from '@nestjs/common';
import { ManagamentsService } from './managaments.service';
import { UsersService } from '@app/resource/users';

@Controller()
export class ManagamentsController {
    constructor(
        private readonly managamentsService: ManagamentsService,
        private readonly usersService: UsersService,
    ) {}

    @Get()
    getHello() {
        return this.usersService.getUser({ email: 'giangvtca@gmail.com' });
    }
}
