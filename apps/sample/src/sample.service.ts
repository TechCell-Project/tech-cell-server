import { Injectable } from '@nestjs/common';

@Injectable()
export class SampleService {
    getPing() {
        return { message: 'Pong' };
    }
}
