import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class GhtkService {
    constructor(private readonly httpService: HttpService) {}
    private readonly logger = new Logger(GhtkService.name);

    public async calculateShippingFee() {
        const url = `${process.env.GHTK_URL}/services/shipment/fee`;
        this.logger.debug(url);
        const data = await firstValueFrom(
            this.httpService
                .post(url, {
                    headers: {
                        Token: process.env.GHTK_API_TOKEN,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .pipe(
                    map((response) => {
                        this.logger.log(response.data);
                        return response.data;
                    }),
                ),
        );
        this.logger.log(data);
        return data;
    }
}
