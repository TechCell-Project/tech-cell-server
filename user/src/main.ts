import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, TcpOptions } from '@nestjs/microservices';
import { UserModule } from './user.module';
import { ConfigService } from './services';

async function bootstrap() {
    const userConfigService = new ConfigService();
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
        transport: userConfigService.get('transport'),
        options: {
            host: userConfigService.get('host'),
            port: userConfigService.get('port'),
        },
    } as TcpOptions);
    await app.listen();
}
bootstrap();
