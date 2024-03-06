import { DynamicModule, Module } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GhnConfig } from 'giaohangnhanh';

@Module({})
export class GhnModule {
    static forRoot(config: GhnConfig): DynamicModule {
        return {
            module: GhnModule,
            providers: [
                {
                    provide: 'GHN_INIT_OPTIONS',
                    useValue: config,
                },
                GhnService,
            ],
            exports: [GhnService],
        };
    }
}
