import { Module } from '@nestjs/common';
import { GhtkService } from './ghtk.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [GhtkService],
    exports: [GhtkModule, GhtkService],
})
export class GhtkModule {}
