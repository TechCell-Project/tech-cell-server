import * as express from 'express';
import { createServer as createHttpServer } from 'http';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
    const port = process.env.API_PORT || 8000;
    const logger = new Logger('api gateway');

    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.enableCors();
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    'script-src': ["'self'", "'unsafe-inline'"],
                },
            },
        }),
    );

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());
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
            'accessToken', // This name here is important for matching up with @ApiBearerAuth() in your controller!
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const swaggerOptions: SwaggerCustomOptions = {
        // Change the page title
        customJsStr: 'document.title = "TechCell documentations"',
    };
    SwaggerModule.setup('/', app, document, swaggerOptions);

    await app.init();
    createHttpServer(server).listen(port, () =>
        logger.log(`⚡️ [http] ready on port: ${port}, url: http://localhost:${port}`),
    );
}
bootstrap();
