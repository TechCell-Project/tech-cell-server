import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const port = process.env.API_PORT;
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(port);
    Logger.log(`⚡️ [api] Starting api-gateway, listening on http://localhost:${port}`);
}
bootstrap();
