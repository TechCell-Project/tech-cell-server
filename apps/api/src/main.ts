import * as fs from 'fs';
import * as express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer, ServerOptions } from 'https';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@app/common/filters/';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

async function bootstrap() {
    const port = process.env.API_PORT || 8000;

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
        Logger.log(`⚡️ [http] ready on port: ${port}, url: http://localhost:${port}`),
    );

    try {
        // Config https
        const portHttps = process.env.API_PORT_HTTPS;
        const httpsPrivateKeyDir = process.env.HTTPS_PRIVATE_KEY_DIR;
        const httpsCertDir = process.env.HTTPS_CERT_DIR;
        if (!portHttps) {
            throw new Error('[env] Missing https port');
        }
        if (!httpsPrivateKeyDir || !httpsCertDir) {
            throw new Error('[env] Missing certificate paths');
        }

        const httpsOptions: ServerOptions = {
            key: fs.readFileSync(httpsPrivateKeyDir),
            cert: fs.readFileSync(httpsCertDir),
        };
        createHttpsServer(httpsOptions, server).listen(portHttps, () =>
            Logger.log(
                `⚡️ [https] ready on port: ${portHttps}, url: https://localhost:${portHttps}`,
            ),
        );
    } catch (error) {
        Logger.warn(`[https] Can not start https server: ${error.message}`);
    }
}
bootstrap();
