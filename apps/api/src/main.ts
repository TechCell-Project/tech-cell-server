import * as fs from 'fs';
import * as express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

async function bootstrap() {
    const port = process.env.API_PORT;

    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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

    await app.init();
    createHttpServer(server).listen(port, () =>
        Logger.log(`⚡️ [http] ready on http://localhost:${port}`),
    );

    // Config https
    const httpsPrivateKeyDir = process.env.HTTPS_PRIVATE_KEY_DIR;
    const httpsPublicKeyDir = process.env.HTTPS_PUBLIC_KEY_DIR;
    if (httpsPrivateKeyDir && httpsPublicKeyDir) {
        Logger.log(`[HttpServer] Https configured`);
        const httpsOptions = {
            key: fs.readFileSync(httpsPrivateKeyDir),
            cert: fs.readFileSync(httpsPublicKeyDir),
        };
        createHttpsServer(httpsOptions, server).listen(443, () =>
            Logger.log(`⚡️ [https] ready on https://localhost:${443}`),
        );
    }
}
bootstrap();
