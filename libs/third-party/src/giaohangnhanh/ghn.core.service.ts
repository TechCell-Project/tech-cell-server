import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { GhnProvinceDTO } from './dtos/province.dto';
import { GhnDistrictDTO } from './dtos/district.dto';
import { GhnWardDTO } from './dtos/ward.dto';
import { GetShippingFeeDTO } from './dtos/get-shipping-fee.dto';

export class GhnCoreService {
    private GHN_URL: string = process.env.GHN_URL;
    private GHN_SHOP_ID: string | number = 189724;
    private GHN_API_TOKEN: string = process.env.GHN_API_TOKEN;

    constructor(protected readonly httpService: HttpService, protected readonly logger: Logger) {
        this.logger = new Logger(GhnCoreService.name);

        this.httpService.axiosRef.defaults.headers = Object.assign(
            this.httpService.axiosRef.defaults.headers,
            {
                'Content-Type': 'application/json',
                token: this.GHN_API_TOKEN,
                shopId: this.GHN_SHOP_ID,
            },
        );
        this.httpService.axiosRef.defaults.baseURL = this.GHN_URL;
    }

    protected async getProvinces(): Promise<GhnProvinceDTO[]> {
        const url = `/shiip/public-api/master-data/province`;
        const data = await firstValueFrom(
            this.httpService.get(url).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error(error.message);
                    throw new Error(error.message);
                }),
                map((response) =>
                    (response.data.data as GhnProvinceDTO[]).map(
                        (province) => new GhnProvinceDTO(province),
                    ),
                ),
            ),
        );
        return data;
    }

    protected async getDistricts(provinceId: number): Promise<GhnDistrictDTO[]> {
        const url = `/shiip/public-api/master-data/district`;
        const data = await firstValueFrom(
            this.httpService
                .get(url, {
                    params: {
                        province_id: provinceId,
                    },
                })
                .pipe(
                    catchError((error: AxiosError) => {
                        this.logger.error(error.message);
                        throw new Error(error.message);
                    }),
                    map((response) =>
                        (response.data.data as GhnDistrictDTO[]).map(
                            (district) => new GhnDistrictDTO(district),
                        ),
                    ),
                ),
        );

        return data;
    }

    protected async getWards(districtId: number): Promise<GhnWardDTO[]> {
        const url = `/shiip/public-api/master-data/ward`;
        const data = await firstValueFrom(
            this.httpService
                .get(url, {
                    params: {
                        district_id: districtId,
                    },
                })
                .pipe(
                    catchError((error: AxiosError) => {
                        this.logger.error(error.message);
                        throw new Error(error.message);
                    }),
                    map((response) =>
                        (response.data.data as GhnWardDTO[]).map((ward) => new GhnWardDTO(ward)),
                    ),
                ),
        );

        return data;
    }

    protected async getShippingFee(data: GetShippingFeeDTO) {
        const url = '/shiip/public-api/v2/shipping-order/fee';
        const bodyPayload = new GetShippingFeeDTO(data);
        const response = await firstValueFrom(
            this.httpService.post(url, bodyPayload).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error(error);
                    console.error(error);
                    throw new Error(error.message);
                }),
                map((response) => response.data.data),
            ),
        );

        return response;
    }
}
