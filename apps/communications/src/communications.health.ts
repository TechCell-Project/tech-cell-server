import { BaseHealthIndicator } from '@app/common/base';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunicationsHealthIndicator extends BaseHealthIndicator {}
