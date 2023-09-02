import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerDocumentOptions,
} from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const port = process.env.API_PORT || 8000;
    const logger = new Logger('api-gateway');

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.use(helmet());
    // Use to compress responses to improve performance
    app.use(compression());

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());

    // Use to validate DTOs and throw exceptions if they are not valid
    app.useGlobalPipes(new ValidationPipe());

    // Use swagger to generate documentations
    const config = new DocumentBuilder()
        .setTitle('TechCell RESTful API Documentations')
        .setContact('TechCell Teams', 'https://techcell.cloud', 'admin@techcell.cloud')
        .setDescription('The documentations of the TechCell RESTful API')
        .setVersion('1.0')
        .addBearerAuth(
            {
                description: `[just text field] Please enter your access token`,
                name: 'Authorization',
                bearerFormat: 'Bearer',
                scheme: 'Bearer',
                type: 'http', // 'apiKey' too
                in: 'Header',
            },
            'accessToken', // This name here is important for matching up with @ApiBearerAuth() in controller!
        )
        .build();
    const swaggerDocumentOptions: SwaggerDocumentOptions = {
        // re-define the url for each method in controller
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    };
    const document = SwaggerModule.createDocument(app, config, swaggerDocumentOptions);
    const swaggerCustomOptions: SwaggerCustomOptions = {
        customSiteTitle: 'TechCell documentations',
    };
    SwaggerModule.setup('/', app, document, swaggerCustomOptions);

    await app.listen(port, () =>
        logger.log(`⚡️ [http] ready on port: ${port}, url: http://localhost:${port}`),
    );
}
bootstrap();
