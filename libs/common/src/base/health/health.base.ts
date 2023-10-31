import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export class BaseHealthIndicator extends HealthIndicator {
    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        const isHealthy = true;
        const result = this.getStatus(key, isHealthy);
        if (isHealthy) {
            return result;
        }
        throw new HealthCheckError(`${key} healthy failed`, result);
    }
}
