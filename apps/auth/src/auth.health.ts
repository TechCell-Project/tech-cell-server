import { BaseHealthIndicator } from '~libs/common/base/health';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthHealthIndicator extends BaseHealthIndicator {}
