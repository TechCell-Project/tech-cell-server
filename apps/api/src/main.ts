import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '~libs/common/filters';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerDocumentOptions,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { ACCESS_TOKEN_NAME } from '~libs/common/constants/api.constant';
import * as swaggerStats from 'swagger-stats';
import { AUTH_SERVICE } from '~libs/common/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { catchException } from '~libs/common';
import { firstValueFrom } from 'rxjs';
import { UserDataResponseDTO } from '~apps/auth/dtos';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
    const port = process.env.API_PORT || 8000;
    const logger = new Logger('api-gateway');

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.use(helmet());

    // Use to catch exceptions and send them to responses
    app.useGlobalFilters(new RpcExceptionFilter());

    // Use to validate DTOs and throw exceptions if they are not valid
    app.useGlobalPipes(
        new I18nValidationPipe({
            transform: true,
        }),
    );
    app.useGlobalFilters(
        new I18nValidationExceptionFilter({
            detailedErrors: false,
        }),
    );

    // Use swagger to generate documentations
    const swaggerDocument = new DocumentBuilder()
        .setTitle('TechCell RESTful API Documentations')
        .setContact('TechCell Teams', 'https://techcell.cloud', 'teams@techcell.cloud')
        .setDescription('The documentations of the TechCell RESTful API')
        .setVersion('0.0.1')
        .addServer('https://api.techcell.cloud')
        .addServer('http://localhost:8000')
        .setLicense(
            'MIT LICENSE',
            'https://github.com/TechCell-Project/tech-cell-server/blob/stable/LICENSE',
        )
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
        customSiteTitle: 'TechCell RESTful API documentations',
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
            timelineBucketDuration: 180000,
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
                    user.role.toString().toLowerCase() !== 'superadmin' &&
                    user.role.toString().toLowerCase() !== 'admin' &&
                    user.role.toString().toLowerCase() !== 'mod'
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
