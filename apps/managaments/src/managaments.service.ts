import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagamentsService {
    getHello(): string {
        return 'Hello World!';
    }
}
