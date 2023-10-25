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
import { ACCESS_TOKEN_NAME } from '@app/common/constants/api.constant';
import * as swaggerStats from 'swagger-stats';
import { AUTH_SERVICE } from '@app/common/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { catchException } from '@app/common';
import { firstValueFrom } from 'rxjs';
import { UserDataResponseDTO } from '~apps/auth/dtos';

async function bootstrap() {
    const port = process.env.API_PORT || 8000;
    const logger = new Logger('api-gateway');

    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:8000',
            'https://techcell.cloud',
            'https://admin.techcell.cloud',
            'https://api.techcell.cloud',
        ],
        methods: ['*'],
    });
    app.use(helmet());

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());

    // Use to validate DTOs and throw exceptions if they are not valid
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    // Use swagger to generate documentations
    const swaggerDocument = new DocumentBuilder()
        .setTitle('TechCell RESTful API Documentations')
        .setContact('TechCell Teams', 'https://techcell.cloud', 'admin@techcell.cloud')
        .setDescription('The documentations of the TechCell RESTful API')
        .setVersion('0.0.1')
        .addServer('https://api.techcell.cloud')
        .addServer('http://localhost:8000')
        .addBearerAuth(
            {
                description: `[just text field] Please enter your access token`,
                name: 'Authorization',
                bearerFormat: 'Bearer',
                scheme: 'Bearer',
                type: 'http', // 'apiKey' too
                in: 'Header',
            },
            ACCESS_TOKEN_NAME, // This name here is important for matching up with @ApiBearerAuth() in controller!
        )
        .build();
    const swaggerDocumentOptions: SwaggerDocumentOptions = {
        // re-define the url for each method in controller
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    };
    const document = SwaggerModule.createDocument(app, swaggerDocument, swaggerDocumentOptions);
    const swaggerCustomOptions: SwaggerCustomOptions = {
        customSiteTitle: 'TechCell documentations',
    };
    SwaggerModule.setup('/', app, document, swaggerCustomOptions);

    const authService: ClientRMQ = app.get(AUTH_SERVICE);
    // Use swagger-stats to generate statistics
    app.use(
        swaggerStats.getMiddleware({
            uriPath: '/api-stats',
            swaggerSpec: document,
            name: 'TechCell API statistics',
            hostname: 'api.techcell.cloud',
            authentication: true,
            onAuthenticate: async function (req, username, password) {
                const user = (await firstValueFrom(
                    authService
                        .send(AuthMessagePattern.login, { emailOrUsername: username, password })
                        .pipe(catchException()),
                )) as UserDataResponseDTO;

                if (!user) {
                    throw new Error('Your username or password is incorrect.');
                }

                if (
                    user.role.toString().toLowerCase() !== 'admin' &&
                    user.role.toString().toLowerCase() !== 'superadmin'
                ) {
                    throw new Error('You are not allowed to access this resource.');
                }

                return true;
            },
        }),
    );

    await app.listen(port, () =>
        logger.log(`⚡️ [http] ready on port: ${port}, url: http://localhost:${port}`),
    );
}
bootstrap();
