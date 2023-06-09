import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { configRmqService } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.SERVICE_PRODUCTS_PORT;
    const app = await NestFactory.create(ProductsModule);
    configRmqService(app, 'RABBITMQ_PRODUCTS_QUEUE');
    await app.listen(port);
    Logger.log(`⚡️ [products] products listening on http://localhost:${port}`);
}
bootstrap();
