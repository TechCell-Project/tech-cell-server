import { Controller, Get, Inject } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    MongooseHealthIndicator,
    HttpHealthIndicator,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
    DiskHealthIndicator,
    HealthIndicatorResult,
    HealthCheckError,
} from '@nestjs/terminus';
import { Transport, RmqOptions, RedisOptions, ClientRMQ } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, of, timeout, TimeoutError } from 'rxjs';
import { ApiOperation, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import {
    AUTH_SERVICE,
    COMMUNICATIONS_SERVICE,
    MANAGEMENTS_SERVICE,
    ORDER_SERVICE,
    SEARCH_SERVICE,
    TASK_SERVICE,
    UTILITY_SERVICE,
} from '@app/common/constants/services.constant';
import { SearchMessagePattern } from '~apps/search/search.pattern';
import { AuthMessagePattern } from '~apps/auth/auth.pattern';
import { CommunicationsMessagePattern } from '~apps/communications/communications.pattern';
import { ManagementsMessagePattern } from '~apps/managements/managements.pattern';
import { OrderMessagePattern } from '~apps/order/order.pattern';
import { TaskMessagePattern } from '~apps/task/task.pattern';
import { UtilityMessagePattern } from '~apps/utility';
import { Throttle } from '@nestjs/throttler';

@Throttle(3, 60)
@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly database: MongooseHealthIndicator,
        private readonly http: HttpHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly disk: DiskHealthIndicator,
        @Inject(AUTH_SERVICE) private readonly authService: ClientRMQ,
        @Inject(COMMUNICATIONS_SERVICE) private readonly communicationsService: ClientRMQ,
        @Inject(MANAGEMENTS_SERVICE) private readonly managementsService: ClientRMQ,
        @Inject(ORDER_SERVICE) private readonly orderService: ClientRMQ,
        @Inject(SEARCH_SERVICE) private readonly searchService: ClientRMQ,
        @Inject(TASK_SERVICE) private readonly taskService: ClientRMQ,
        @Inject(UTILITY_SERVICE) private readonly utilityService: ClientRMQ,
    ) {}

    @ApiOperation({
        summary: 'Health check',
        description: 'Get health check',
    })
    @ApiTooManyRequestsResponse({
        description: 'Too many requests (3 requests per 60 seconds))',
    })
    @Get('/')
    @HealthCheck()
    readiness() {
        return this.health.check([
            () =>
                this.disk.checkStorage('storage', {
                    path: process.cwd(),
                    thresholdPercent: 1 * 1024 * 1024 * 1024, // 1GB
                }),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
            () => this.memory.checkRSS('memory_rss', 200 * 1024 * 1024), // 200MB
            async () => this.database.pingCheck('mongodb', { timeout: 300 }),
            () =>
                this.http.responseCheck(
                    'frontend techcell',
                    'https://techcell.cloud',
                    (res) => res.status === 200,
                ),
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
            async () =>
                this.microservice.pingCheck<RmqOptions>('rabbitmq', {
                    transport: Transport.RMQ,
                    timeout: 3000,
                    options: {
                        urls: [process.env.RABBITMQ_URLS || 'amqp://localhost:5672'],
                    },
                }),
            () => this.http.pingCheck('rabbitmq managements', 'https://amqp-m.techcell.cloud'),
            async () =>
                healthCheckService(
                    this.authService,
                    AuthMessagePattern.isHealthy,
                    'auth service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.communicationsService,
                    CommunicationsMessagePattern.isHealthy,
                    'communications service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.managementsService,
                    ManagementsMessagePattern.isHealthy,
                    'managements service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.orderService,
                    OrderMessagePattern.isHealthy,
                    'order service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.searchService,
                    SearchMessagePattern.isHealthy,
                    'search service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.taskService,
                    TaskMessagePattern.isHealthy,
                    'task service',
                    1000,
                ),
            async () =>
                healthCheckService(
                    this.utilityService,
                    UtilityMessagePattern.isHealthy,
                    'utility service',
                    1000,
                ),
        ]);
    }
}

// Utils
async function healthCheckService(
    service: ClientRMQ,
    pattern: any,
    key: string,
    timeoutMs: number,
) {
    return await firstValueFrom<HealthIndicatorResult>(
        service.send(pattern, { key }).pipe(
            catchError((err) => {
                return of(err);
            }),
            timeout(timeoutMs),
            map((res) => res),
        ),
    ).catch((err) => {
        if (err instanceof TimeoutError) {
            const res: HealthIndicatorResult = {
                [key]: {
                    status: 'down',
                    message: 'timeout',
                },
            };
            throw new HealthCheckError(`${key} healthy failed`, res);
        }

        throw new HealthCheckError(`${key} healthy failed`, { err });
    });
}