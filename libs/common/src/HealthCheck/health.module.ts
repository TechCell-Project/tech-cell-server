import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { MongodbModule, RabbitMQModule } from '@app/common';

@Module({
    imports: [
        TerminusModule.forRoot({
            errorLogStyle: 'pretty',
        }),
        HttpModule,
        MongodbModule,
        RabbitMQModule,
    ],
    controllers: [HealthController],
})
export class HealthModule {}
