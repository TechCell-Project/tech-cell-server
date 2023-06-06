import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.port = process.env.USER_SERVICE_PORT || 8002;
    this.envConfig.host = process.env.USER_SERVICE_HOST || '0.0.0.0';
    this.envConfig.transport = Transport.TCP;
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
