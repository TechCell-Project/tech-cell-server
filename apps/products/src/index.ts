import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { configRmqService } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(ProductsModule);
    configRmqService(app, 'RABBITMQ_PRODUCTS_QUEUE');
}
bootstrap();
