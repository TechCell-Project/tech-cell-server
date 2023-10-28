import { Controller, Res, Get } from '@nestjs/common';
import { Response } from 'express';

@Controller('/')
export class CommunicationsController {
    @Get('/')
    getIndex(@Res() res: Response) {
        return res.redirect('https://api.techcell.cloud');
    }
}
