import { NestFactory } from '@nestjs/core';
import { SampleModule } from './sample.module';
import { useRabbitMQ } from '@app/common';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilter } from '@app/common/filters/';

async function bootstrap() {
    const logger = new Logger('sample');
    const app = await NestFactory.create(SampleModule);
    app.useGlobalFilters(new RpcExceptionFilter());
    useRabbitMQ(app, 'RABBITMQ_SAMPLE_QUEUE');
    await app.startAllMicroservices().then(() => logger.log(`⚡️ service is ready`));
    app.listen(3000, () => logger.log(`⚡️ server is listening port ...`));
}
bootstrap();
