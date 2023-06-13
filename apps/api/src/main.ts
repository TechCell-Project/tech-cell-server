import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const port = process.env.API_PORT;
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());

    // Use swagger to generate documentations
    const config = new DocumentBuilder()
        .setTitle('TechCell RESTfull API Documentation')
        .setDescription('The documentations of the TechCell RESTful API')
        .setVersion('1.0')
        .addTag('docs')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(port);
    Logger.log(`⚡️ [api] Starting api-gateway, listening on http://localhost:${port}`);
}
bootstrap();
