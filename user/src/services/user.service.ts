import { Injectable, HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
  getHello(): string {
    return 'Hello World!';
  }

  async getUsers() {
    return {
      status: HttpStatus.OK,
      message: 'user_get_many_success',
      users: [
        {
          email: '1',
          password: 'password1',
        },
        {
          email: '2',
          password: 'password2',
        },
        {
          email: '3',
          password: 'password3',
        },
      ],
    };
  }
}
