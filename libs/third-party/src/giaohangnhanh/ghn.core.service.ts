import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { GhnProvinceDTO } from './dtos/province.dto';
import { GhnDistrictDTO } from './dtos/district.dto';
import { GhnWardDTO } from './dtos/ward.dto';
import { GetShippingFeeDTO } from './dtos/get-shipping-fee.dto';
import { TGhnDistrict, TGhnProvince, TGhnWard } from './types';
import { TShippingFeeResponse } from './types/shipping-fee-response.ghn';

export class GhnCoreService {
    private GHN_URL: string = process.env.GHN_URL;
    private GHN_SHOP_ID: string | number = +process.env.GHN_SHOP_ID;
    private GHN_API_TOKEN: string = process.env.GHN_API_TOKEN;

    constructor(
        protected readonly httpService: HttpService,
        protected readonly logger: Logger,
    ) {
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

    public async getProvinces(): Promise<GhnProvinceDTO[]> {
        const url = `/shiip/public-api/master-data/province`;
        const data = await firstValueFrom(
            this.httpService.get(url).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
                map(
                    (response) =>
                        (response.data.data as TGhnProvince[])?.map(
                            (province) => new GhnProvinceDTO(province),
                        ),
                ),
            ),
        );
        return data;
    }

    public async getDistricts(provinceId: number): Promise<GhnDistrictDTO[]> {
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
                        throw error;
                    }),
                    map(
                        (response) =>
                            (response.data.data as TGhnDistrict[])?.map(
                                (district) => new GhnDistrictDTO(district),
                            ),
                    ),
                ),
        );

        return data;
    }

    public async getWards(districtId: number): Promise<GhnWardDTO[]> {
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
                        throw error;
                    }),
                    map(
                        (response: AxiosResponse) =>
                            (response.data.data as TGhnWard[])?.map((ward) => new GhnWardDTO(ward)),
                    ),
                ),
        );

        return data;
    }

    protected async getShippingFee(data: GetShippingFeeDTO): Promise<TShippingFeeResponse> {
        const url = '/shiip/public-api/v2/shipping-order/fee';
        const bodyPayload = new GetShippingFeeDTO(data);
        const response = await firstValueFrom(
            this.httpService.post(url, bodyPayload).pipe(
                catchError((error: AxiosError) => {
                    this.logger.error(error);
                    throw new Error(error.message);
                }),
                map((response) => response.data.data as TShippingFeeResponse),
            ),
        );

        return response;
    }
}
