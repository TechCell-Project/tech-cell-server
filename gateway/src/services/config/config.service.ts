import { Transport } from '@nestjs/microservices';

export class ConfigService {
    private readonly envConfig: { [key: string]: any } = null;

    constructor() {
        this.envConfig = {};
        this.envConfig.port = process.env.API_GATEWAY_PORT || 8000;
        this.envConfig.authService = {
            options: {
                port: process.env.AUTH_SERVICE_PORT || 8001,
                host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
            },
            transport: Transport.TCP,
        };
        this.envConfig.userService = {
            options: {
                port: process.env.USER_SERVICE_PORT || 8002,
                host: process.env.USER_SERVICE_HOST || '0.0.0.0',
            },
            transport: Transport.TCP,
        };
    }
    get(key: string): any {
        return this.envConfig[key];
    }
}
