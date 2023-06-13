import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

async function bootstrap() {
    const port = process.env.API_PORT;
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());

    // Use swagger to generate documentations
    const config = new DocumentBuilder()
        .setTitle('TechCell RESTful API Documentations')
        .setContact('TechCell Teams', 'https://techcell.cloud', 'admin@techcell.cloud')
        .setDescription('The documentations of the TechCell RESTful API')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const swaggerOptions: SwaggerCustomOptions = {
        // Change the page title
        customJsStr: 'document.title = "TechCell documentations"',
    };
    SwaggerModule.setup('/', app, document, swaggerOptions);

    await app.listen(port);
    Logger.log(`⚡️ [api] Starting api-gateway, listening on http://localhost:${port}`);
}
bootstrap();
