import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from './services';
import { AppModule } from './app.module';

async function bootstrap() {
    const apiGatewayPort = new ConfigService().get('port');
    const app = await NestFactory.create(AppModule);
    const options = new DocumentBuilder()
        .setTitle('API docs')
        .addTag('auth')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    await app.listen(apiGatewayPort);
    console.log('⚡️ [gateway] Server gateway is listening on port ' + apiGatewayPort);
}
bootstrap();
