import { repl } from '@nestjs/core';
import { AppModule } from './api/src/app.module';
import { Logger } from '@nestjs/common';
import { resolveLogFile } from '~libs/common/utils/files.util';
import { dateToString } from '~libs/common/utils/shared.util';

async function bootstrap() {
    const logger = new Logger('api-repl');
    const replServer = await repl(AppModule);
    if (replServer) {
        logger.log('REPL server is running');
        replServer.setupHistory(resolveLogFile('./logs/repl', `.repl_${dateToString()}`), (err) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}
bootstrap();
