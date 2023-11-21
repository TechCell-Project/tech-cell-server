import { BaseHealthIndicator } from '~libs/common/base';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchHealthIndicator extends BaseHealthIndicator {}
