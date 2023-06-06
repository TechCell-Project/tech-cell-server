import { Controller, Get } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { UserService } from '../services';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @MessagePattern('user_get_many')
  public async getUsers() {
    const result = await this.userService.getUsers();
    return result;
  }
}
