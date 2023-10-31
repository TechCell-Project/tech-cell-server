import { BaseHealthIndicator } from '@app/common/base/health';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthHealthIndicator extends BaseHealthIndicator {}
