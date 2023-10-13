import { Module } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [GhnService],
    exports: [GhnModule, GhnService],
})
export class GhnModule {}
