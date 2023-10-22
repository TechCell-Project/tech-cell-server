import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    MongooseHealthIndicator,
    HttpHealthIndicator,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport, RmqOptions, RedisOptions } from '@nestjs/microservices';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: MongooseHealthIndicator,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator,
        private microservice: MicroserviceHealthIndicator,
    ) {}

    @ApiOperation({
        summary: 'Health check',
        description: 'Get health check',
    })
    @Get()
    @HealthCheck()
    readiness() {
        return this.health.check([
            async () => this.db.pingCheck('database', { timeout: 300 }),
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
            () =>
                this.http.responseCheck(
                    'frontend techcell',
                    'https://techcell.cloud',
                    (res) => res.status === 200,
                ),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            async () =>
                this.microservice.pingCheck<RmqOptions>('rmq', {
                    transport: Transport.RMQ,
                    timeout: 3000,
                    options: {
                        urls: [process.env.RABBITMQ_URLS || 'amqp://localhost:5672'],
                    },
                }),
            async () =>
                this.microservice.pingCheck<RedisOptions>('redis', {
                    transport: Transport.REDIS,
                    timeout: 3000,
                    options: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: +process.env.REDIS_PORT || 6379,
                        password: process.env.REDIS_PASSWORD || 'techcell',
                    },
                }),
        ]);
    }
}
